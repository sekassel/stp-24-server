import { Injectable } from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {SystemDocument} from '../system/system.schema';
import {SYSTEM_UPGRADES} from './system-upgrade';

@Injectable()
export class GameLogicHandler {
  constructor(
    private empireService: EmpireService,
    private systemService: SystemService,
  ) {
  }

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (!game.started) {
      return;
    }

    const empires = await this.empireService.initEmpires(game);
    if (!empires.length) {
      // game was already started
      return;
    }

    const systems = await this.systemService.generateMap(game);
    const homeSystems = new Set<string>();

    // select a home system for each empire
    for (const empire of empires) {
      let homeSystem: SystemDocument;
      do {
        homeSystem = systems.random();
      } while (
        homeSystems.has(homeSystem._id.toString())
        || Object.keys(homeSystem.links).some(link => homeSystems.has(link))
      );
      homeSystems.add(homeSystem._id.toString());

      homeSystem.owner = empire._id;
      homeSystem.population = empire.resources.population;
      homeSystem.upgrade = 'developed';
      homeSystem.capacity *= SYSTEM_UPGRADES.developed.capacity_multiplier;
      if (empire.homeSystem) {
        homeSystem.type = empire.homeSystem;
      }
      this.systemService.generateDistricts(homeSystem, empire);
      homeSystem.districts = homeSystem.districtSlots;
      homeSystem.buildings = [
        'power_plant',
        'mine',
        'farm',
        'research_lab',
        'foundry',
        // 'refinery',
      ];
    }

    await this.systemService.saveAll(systems);
  }
}
