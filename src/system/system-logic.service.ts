import {BadRequestException, Injectable} from '@nestjs/common';
import {SystemDocument} from './system.schema';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {calculateVariable, calculateVariables} from '../game-logic/variables';
import {SYSTEM_TYPES} from '../game-logic/system-types';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {District, Variable} from '../game-logic/types';
import {BuildingName} from '../game-logic/buildings';

@Injectable()
export class SystemLogicService {
  constructor(
    // Keep injections to a minimum, this should be pure logic
  ) {
  }

  upgradeSystem(system: SystemDocument, empire: EmpireDocument) {
    const upgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
    if (!upgrade) {
      throw new BadRequestException('System cannot be upgraded further.');
    }

    system.upgrade = upgrade;
    system.capacity *= SYSTEM_UPGRADES[upgrade].capacity_multiplier;

    switch (upgrade) {
      case 'explored':
        this.generateDistricts(system, empire);
        break;
      case 'colonized':
        system.owner = empire._id;
        system.population = calculateVariable('empire.pop.colonists', empire, system);
        break;
    }
  }

  generateDistricts(system: SystemDocument, empire: Empire) {
    // Set slots for generic districts to capacity
    const nDistricts = SYSTEM_TYPES[system.type].district_percentage * system.capacity;
    if (!nDistricts) {
      return;
    }

    for (const district of Object.values(DISTRICTS)) {
      if (!('default' in district.chance)) {
        system.districtSlots[district.id] = nDistricts;
      }
    }

    //Get district chances for this system type
    const districtChances: Partial<Record<Variable, number>> = {};

    for (const district of Object.values(DISTRICTS)) {
      const chance: District['chance'] = district.chance;
      if (chance) {
        districtChances[`districts.${district.id}.chance.${system.type}` as Variable] = chance[system.type] ?? chance.default ?? 0;
      }
    }

    calculateVariables(districtChances, empire, system);

    //Generate random districts depending on the chances
    this.randomDistricts(system, nDistricts, districtChances);
  }

  private randomDistricts(system: SystemDocument, nDistricts: number, districtChances: Partial<Record<Variable, number>>) {
    for (let i = 0; i < nDistricts; i++) {
      const type = Object.entries(districtChances).randomWeighted(i => i[1])[0] as Variable;

      // This also allows custom variables to add new district chances
      const district = type.split('.')[1] as DistrictName;
      system.districtSlots[district] = (system.districtSlots[district] ?? 0) + 1;
    }
    system.markModified('districtSlots');
  }

  buildBuilding(system: SystemDocument, building: BuildingName) {
    if (this.usedCapacity(system) + 1> system.capacity) {
      throw new BadRequestException('System is at capacity.');
    }
    system.buildings.push(building);
  }

  buildDistrict(system: SystemDocument, district: DistrictName) {
    if ((system.districts[district] ?? 0) >= (system.districtSlots[district] ?? 0)) {
      throw new BadRequestException('District is at capacity.');
    }
    if (this.usedCapacity(system) + 1 > system.capacity) {
      throw new BadRequestException('System is at capacity.');
    }
    system.districts[district] = (system.districts[district] ?? 0) + 1;
    system.markModified('districts');
  }

  private usedCapacity(system: SystemDocument) {
    return system.buildings.length + Object.values(system.districts).sum();
  }
}
