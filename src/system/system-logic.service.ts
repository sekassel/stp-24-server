import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {SystemDocument} from './system.schema';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {calculateVariable, calculateVariables} from '../game-logic/variables';
import {SYSTEM_TYPES} from '../game-logic/system-types';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {District, Variable} from '../game-logic/types';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';
import {ResourceName} from '../game-logic/resources';
import {EmpireLogicService} from '../empire/empire-logic.service';

@Injectable()
export class SystemLogicService {
  constructor(
    // Keep injections to a minimum, this should be pure logic
    private readonly empireLogicService: EmpireLogicService,
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

  destroyDistricts(system: SystemDocument, districts: Partial<Record<DistrictName, number>>, empire: EmpireDocument) {
    for (const [district, amount] of Object.entries(districts) as [DistrictName, number][]) {
      if (amount === 0) {
        continue;
      }
      if (amount > 0) {
        throw new BadRequestException('Cannot add districts with this endpoint. Use a Job instead.');
      }
      const oldAmount = system.districts[district] ?? 0;
      if (oldAmount < -amount) {
        throw new ConflictException(`Not enough districts of ${district} to destroy`);
      }

      const districtCost = this.empireLogicService.getCosts('districts', district, empire, system);
      for (const [resource, cost] of Object.entries(districtCost)) {
        // Refund half of the cost
        empire.resources[resource as ResourceName] += cost * -amount / 2;
        empire.markModified('resources');
      }

      // Destroy the district (amount is negative)
      system.districts[district] = oldAmount + amount;
      system.markModified('districts');
    }
  }

  updateBuildings(system: SystemDocument, buildings: BuildingName[], empire: EmpireDocument) {
    const oldBuildings = this.buildingsOccurrences(system.buildings);
    const newBuildings = this.buildingsOccurrences(buildings);

    // Find out which buildings to remove and add
    const removeBuildings: Partial<Record<BuildingName, number>> = {};

    for (const [building, amount] of Object.entries(oldBuildings)) {
      const bName = building as BuildingName;

      if (newBuildings[bName] < amount) {
        removeBuildings[bName] = amount - newBuildings[bName];
      } else if (newBuildings[bName] > amount) {
        throw new BadRequestException('Cannot add buildings with this endpoint. Use a Job instead.')
      }
    }

    this.removeBuildings(system, removeBuildings, empire);

    system.buildings = buildings;
  }

  private buildingsOccurrences(buildings: BuildingName[]): Record<BuildingName, number> {
    const occurrences: Record<BuildingName, number> =
      Object.fromEntries(BUILDING_NAMES.map(building => [building as BuildingName, 0])) as Record<BuildingName, number>;

    for (const building of buildings) {
      occurrences[building]++;
    }

    return occurrences;
  }

  private removeBuildings(system: SystemDocument, removeBuildings: Partial<Record<BuildingName, number>>, empire: EmpireDocument) {
    //Remove buildings and refund half of the cost
    for (const [building, amount] of Object.entries(removeBuildings)) {
      const bName = building as BuildingName;
      const costs = this.empireLogicService.getCosts('buildings', bName, empire, system);

      for (let i = 0; i < amount; i++) {
        system.buildings.splice(system.buildings.indexOf(bName), 1);

        for (const [resource, resourceCost] of Object.entries(costs) as [ResourceName, number][]) {
          empire.resources[resource] += resourceCost / 2;
        }

        empire.markModified('resources');
      }
    }
  }
}