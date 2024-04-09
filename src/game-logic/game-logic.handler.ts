import { Injectable } from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {SystemDocument} from '../system/system.schema';
import {SYSTEM_UPGRADES} from './system-upgrade';
import {MemberService} from '../member/member.service';
import {DistrictName} from './districts';
import {HOMESYSTEM_BUILDINGS, HOMESYSTEM_DISTRICT_COUNT, HOMESYSTEM_DISTRICTS} from './constants';

@Injectable()
export class GameLogicHandler {
  constructor(
    private memberService: MemberService,
    private empireService: EmpireService,
    private systemService: SystemService,
  ) {
  }

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (!game.started) {
      return;
    }

    const existingEmpires = await this.empireService.count({
      game: game._id,
    });
    if (existingEmpires) {
      return;
    }

    const members = await this.memberService.findAll({
      game: game._id,
      empire: {$exists: true},
    });
    const empires = await this.empireService.initEmpires(members);
    if (!empires.length) {
      // game was already started
      return;
    }

    const systems = await this.systemService.generateMap(game);
    const homeSystems = new Set<string>();

    // select a home system for each empire
    for (let i = 0; i < empires.length; i++){
      const empire = empires[i];
      const member = members[i];
      const homeSystem = this.selectHomeSystem(systems, homeSystems);

      homeSystem.owner = empire._id;
      homeSystem.population = empire.resources.population;
      homeSystem.upgrade = 'developed';
      homeSystem.capacity *= SYSTEM_UPGRADES.developed.capacity_multiplier;
      if (member.empire!.homeSystem) {
        homeSystem.type = member.empire!.homeSystem;
      }
      this.systemService.generateDistricts(homeSystem, empire);

      // every home system starts with 15 districts
      this.generateDistricts(homeSystem);

      // plus 7 buildings, so 22 jobs in total
      homeSystem.buildings = HOMESYSTEM_BUILDINGS;

      const totalJobs = Object.values(homeSystem.districts).sum() + homeSystem.buildings.length;
      if (homeSystem.capacity < totalJobs) {
        homeSystem.capacity = totalJobs;
      }

      // then 3 pops will be unemployed initially.
      empire.homeSystem = homeSystem._id;
    }

    await this.empireService.saveAll(empires);
    await this.systemService.saveAll(systems);
  }

  private selectHomeSystem(systems: SystemDocument[], homeSystems: Set<string>) {
    let homeSystem: SystemDocument;
    do {
      homeSystem = systems.random();
    } while (
      homeSystems.has(homeSystem._id.toString())
      || Object.keys(homeSystem.links).some(link => homeSystems.has(link))
      );
    homeSystems.add(homeSystem._id.toString());
    return homeSystem;
  }

  private generateDistricts(homeSystem: SystemDocument) {
    for (const district of HOMESYSTEM_DISTRICTS) {
      homeSystem.districts[district] = HOMESYSTEM_DISTRICT_COUNT;
      if (!homeSystem.districtSlots[district] || homeSystem.districtSlots[district]! < HOMESYSTEM_DISTRICT_COUNT) {
        homeSystem.districtSlots[district] = HOMESYSTEM_DISTRICT_COUNT;
        homeSystem.markModified('districtSlots');
      }
    }
    homeSystem.markModified('districts');
  }
}
