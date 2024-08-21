import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {System, SystemDocument} from './system.schema';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {calculateVariable, calculateVariables, getVariables} from '../game-logic/variables';
import {SYSTEM_TYPES} from '../game-logic/system-types';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {District, Variable} from '../game-logic/types';
import {BUILDING_NAMES, BuildingName, BUILDINGS} from '../game-logic/buildings';
import {ResourceName} from '../game-logic/resources';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {AggregateResult} from '../game-logic/aggregates';
import {FleetDocument} from '../fleet/fleet.schema';
import {ShipDocument} from '../ship/ship.schema';
import {SHIP_TYPES, ShipTypeName} from '../game-logic/ships';
import {Member} from '../member/member.schema';
import {HOMESYSTEM_BUILDINGS, HOMESYSTEM_DISTRICT_COUNT, HOMESYSTEM_DISTRICTS} from '../game-logic/constants';
import {Types} from 'mongoose';

@Injectable()
export class SystemLogicService {
  constructor(
    // Keep injections to a minimum, this should be pure logic
    private readonly empireLogicService: EmpireLogicService,
  ) {
  }

  initHomeSystem(homeSystem: SystemDocument, empire: Empire, member?: Member) {
    homeSystem.owner = empire._id;
    homeSystem.population = empire.resources.population;
    homeSystem.upgrade = 'upgraded';
    homeSystem.capacity *= SYSTEM_UPGRADES.upgraded.capacity_multiplier;
    homeSystem.health = SYSTEM_UPGRADES.upgraded.health;
    if (member?.empire?.homeSystem) {
      homeSystem.type = member.empire.homeSystem;
    }
    this.generateDistrictSlots(homeSystem, empire);

    // every home system starts with 15 districts
    this.generateDistricts(homeSystem);

    // plus 8 buildings, so 23 jobs in total
    homeSystem.buildings = HOMESYSTEM_BUILDINGS;

    const totalJobs = Object.values(homeSystem.districts).sum() + homeSystem.buildings.length;
    if (homeSystem.capacity < totalJobs) {
      homeSystem.capacity = totalJobs;
    }

    // then 3 pops will be unemployed initially.
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

  upgradeSystem(system: SystemDocument, empire: EmpireDocument) {
    const upgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
    if (!upgrade) {
      throw new BadRequestException('System cannot be upgraded further.');
    }

    system.upgrade = upgrade;
    system.capacity *= SYSTEM_UPGRADES[upgrade].capacity_multiplier;

    switch (upgrade) {
      case 'explored':
        this.generateDistrictSlots(system, empire);
        break;
      case 'colonized':
        system.owner = empire._id;
        system.population = calculateVariable('empire.pop.colonists', empire, system);
        break;
    }
  }

  generateDistrictSlots(system: SystemDocument, empire: Empire) {
    // Set slots for generic districts to capacity
    const nDistricts = Math.floor(SYSTEM_TYPES[system.type].district_percentage * system.capacity);
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
      const segments = type.split('.');
      // Custom variables might also add completely unrelated things, so we need to double check
      if (segments.length === 4 && segments[0] === 'districts' && segments[1] in DISTRICTS && segments[2] === 'chance' && segments[3] === system.type) {
        const district = segments[1] as DistrictName;
        system.districtSlots[district] = (system.districtSlots[district] ?? 0) + 1;
      }
    }
    system.markModified('districtSlots');
  }

  buildBuilding(system: SystemDocument, building: BuildingName) {
    if (this.usedCapacity(system) + 1 > system.capacity) {
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
    const variables = getVariables('districts');
    calculateVariables(variables, empire, system);

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

      const districtCost = this.empireLogicService.getCosts(`districts.${district}.cost`, variables);
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
    const variables = getVariables('buildings');
    calculateVariables(variables, empire, system);

    //Remove buildings and refund half of the cost
    for (const [building, amount] of Object.entries(removeBuildings)) {
      const bName = building as BuildingName;
      const costs = this.empireLogicService.getCosts(`buildings.${bName}.cost`, variables);

      for (let i = 0; i < amount; i++) {
        system.buildings.splice(system.buildings.indexOf(bName), 1);

        for (const [resource, resourceCost] of Object.entries(costs) as [ResourceName, number][]) {
          empire.resources[resource] += resourceCost / 2;
        }

        empire.markModified('resources');
      }
    }
  }

  maxHealthOrDefense(system: System, empire: Empire, which: 'health' | 'defense', variables?: Record<Variable, number>, aggregate?: AggregateResult): number {
    const upgradeVariable = `systems.${system.upgrade}.${which}` as const satisfies Variable;
    const fortressVariable = `buildings.fortress.${which}` as const satisfies Variable;
    const relevantVariables = variables ?? {
      [upgradeVariable]: SYSTEM_UPGRADES[system.upgrade][which],
      [fortressVariable]: BUILDINGS.fortress[which],
    };
    if (!variables) {
      calculateVariables(relevantVariables, empire, system);
    }

    const baseValue = relevantVariables[upgradeVariable];
    const fortressCount = system.buildings.countIf(b => b === 'fortress');
    const fortressBonus = fortressCount * relevantVariables[fortressVariable];
    const total = baseValue + fortressBonus;
    if (aggregate) {
      aggregate.total += total;
      aggregate.items.push({
        variable: upgradeVariable,
        count: 1,
        subtotal: baseValue,
      });
      fortressBonus && aggregate.items.push({
        variable: fortressVariable,
        count: fortressCount,
        subtotal: fortressBonus,
      });
    }
    return total;
  }

  getTravelTime(paths: SystemDocument[], fleet: FleetDocument, shipTypes: ShipTypeName[], empire: EmpireDocument): number {
    const slowestShipSpeed = this.getSlowestShipSpeed(fleet, shipTypes, empire);
    let totalTravelTime = 0;
    for (let i = 1; i < paths.length; i++) {
      const fromSystem = paths[i - 1];
      const toSystem = paths[i];
      const linkTime = this.getLinkTime(fromSystem, toSystem._id, slowestShipSpeed);
      if (linkTime === null) {
        throw new ConflictException(`No link from ${fromSystem._id} to ${toSystem._id}`);
      }
      totalTravelTime += linkTime;
    }
    return totalTravelTime;
  }

  getLinkTime(fromSystem: SystemDocument, toSystem: Types.ObjectId, slowestShipSpeed: number): number | null {
    if (fromSystem._id.equals(toSystem._id)) {
      return 0;
    }
    const linkTime = fromSystem.links[toSystem.toString()];
    if (!linkTime) {
      return null;
    }
    return Math.max(Math.round(linkTime / slowestShipSpeed), 1);
  }

  getSlowestShipSpeed(fleet: FleetDocument, shipTypes: ShipTypeName[], empire: EmpireDocument): number {
    if (!shipTypes.length) {
      throw new NotFoundException('No ships in the fleet.');
    }
    let slowestSpeed = Infinity;
    for (const shipType of shipTypes) {
      const calculatedSpeed = calculateVariable(`ships.${shipType}.speed`, empire, fleet);
      if (calculatedSpeed !== undefined && calculatedSpeed < slowestSpeed) {
        slowestSpeed = calculatedSpeed;
      }
    }
    return slowestSpeed;
  }
}
