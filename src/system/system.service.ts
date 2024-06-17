import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemDocument} from './system.schema';
import {Game} from "../game/game.schema";
import {UpdateSystemDto} from './system.dto';
import {SYSTEM_UPGRADES, SystemUpgradeName} from '../game-logic/system-upgrade';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';
import {SYSTEM_TYPES} from "../game-logic/system-types";
import {calculateVariable, calculateVariables, getVariables} from '../game-logic/variables';
import {EmpireService} from "../empire/empire.service";
import {Empire, EmpireDocument} from "../empire/empire.schema";
import {District, Variable} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {SystemGeneratorService} from "./systemgenerator.service";
import {MemberService} from '../member/member.service';
import {SystemType} from "./system-type.enum";

function getCosts(category: 'districts' | 'buildings', district: DistrictName | BuildingName, districtVariables: any): Record<ResourceName, number> {
  const districtCostKeys = Object.keys(districtVariables).filter(key =>
    key.startsWith(`${category}.${district}.cost.`)
  );

  return Object.fromEntries(districtCostKeys.map(key =>
    [key.split('.').pop() as ResourceName, districtVariables[key]])
  ) as Record<ResourceName, number>;
}

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
    private memberService: MemberService,
    private empireService: EmpireService,
    private systemGenerator: SystemGeneratorService,
  ) {
    super(model);
  }

  async updateSystem(system: SystemDocument, dto: UpdateSystemDto, empire: EmpireDocument): Promise<SystemDocument | null> {
    const {upgrade, districts, buildings, ...rest} = dto;
    system.set(rest);
    if (upgrade) {
      await this.upgradeSystem(system, upgrade, empire);
    }
    if (districts) {
      await this.updateDistricts(system, districts, empire);
    }
    if (buildings) {
      await this.updateBuildings(system, buildings, empire);
    }
    await this.empireService.saveAll([empire]);
    await this.saveAll([system]) // emits update events
    return system;
  }

  async upgradeSystem(system: SystemDocument, upgrade: SystemUpgradeName, empire: EmpireDocument) {
    const upgrades = Object.keys(SYSTEM_UPGRADES);
    if (upgrades.indexOf(upgrade) !== upgrades.indexOf(system.upgrade) + 1) {
      throw new BadRequestException(`Invalid upgrade ${upgrade} for system ${system._id}`);
    }
    system.upgrade = upgrade;
    system.capacity *= SYSTEM_UPGRADES[upgrade].capacity_multiplier;

    switch (upgrade) {
      case SystemType.EXPLORED:
        this.generateDistricts(system, empire);
        break;
      case SystemType.COLONIZED:
        system.owner = empire._id;
        system.population = calculateVariable('empire.pop.colonists', empire, system);
        this.applyCosts(empire, upgrade);
        break;
      case SystemType.UPGRADED:
      case SystemType.DEVELOPED:
        this.applyCosts(empire, upgrade);
        break;
    }
  }

  async updateDistricts(system: SystemDocument, districts: Partial<Record<DistrictName, number>>, empire: EmpireDocument) {
    const districtVariables = getVariables('districts');
    const districtSlots = {...system.districtSlots};
    const allDistricts = {...system.districts};
    const builtDistrictsCount = Object.values(system.districts).sum();
    let amountOfDistrictsToBeBuilt = 0;

    calculateVariables(districtVariables, empire);
    for (const [district, amount] of Object.entries(districts)) {
      if (amount === 0) {
        continue;
      }
      const districtName = district as DistrictName;
      const districtTypeSlots = districtSlots[districtName];
      const builtDistrictsOfType = allDistricts[districtName] ?? 0;
      amountOfDistrictsToBeBuilt += amount ?? 0;

      // Check if districts don't exceed districtSlots
      if (districtTypeSlots !== undefined && districtTypeSlots - builtDistrictsOfType < amount) {
        throw new ConflictException(`Insufficient district slots for ${districtName}`);
      }

      // Check if district slots don't exceed system capacity
      if (system.buildings.length + builtDistrictsCount + amountOfDistrictsToBeBuilt > system.capacity) {
        throw new ConflictException(`System ${system._id} has not enough capacity to build the districts`);
      }

      // Check if empire has enough resource to buy the district or the given amount is negative to refund resources
      const districtCost: Record<ResourceName, number> = getCosts('districts', districtName, districtVariables);
      const empireResources: Record<ResourceName, number> = empire.resources;
      for (const resource of Object.keys(districtCost)) {
        const cost = districtCost[resource as ResourceName];
        const empireResourceAmount = empireResources[resource as ResourceName];

        if (empireResourceAmount === undefined || empireResourceAmount < cost * amount) {
          throw new ConflictException(`Empire ${empire._id} has not enough ${resource} to buy the district`);
        }

        if (amount > 0) {
          empire.resources[resource as ResourceName] -= cost * amount;
        } else {
          if (builtDistrictsCount < -amount) {
            throw new ConflictException(`Not enough districts of ${districtName} to destroy`);
          }
          empire.resources[resource as ResourceName] += cost * -amount / 2;
        }
        empire.markModified('resources');
      }
    }

    for (const [district, amount] of Object.entries(districts)) {
      const districtName = district as DistrictName;
      system.districts[districtName] = (system.districts[districtName] ?? 0) + amount;
    }
    system.markModified('districts');
  }

  async updateBuildings(system: SystemDocument, buildings: BuildingName[], empire: EmpireDocument) {
    const oldBuildings = this.buildingsOccurrences(system.buildings);
    const newBuildings = this.buildingsOccurrences(buildings);

    // Find out which buildings to remove and add
    const removeBuildings: Partial<Record<BuildingName, number>> = {};
    const addBuildings: Partial<Record<BuildingName, number>> = {};

    for (const [building, amount] of Object.entries(oldBuildings)) {
      const bName = building as BuildingName;

      if (newBuildings[bName] < amount) {
        removeBuildings[bName] = amount - newBuildings[bName];
      } else if (newBuildings[bName] > amount) {
        addBuildings[bName] = newBuildings[bName] - amount;
      }
    }

    const buildingVariables = getVariables('buildings');
    calculateVariables(buildingVariables, empire);

    const costs: Record<BuildingName, [ResourceName, number][]> = {} as Record<BuildingName, [ResourceName, number][]>;
    for (const building of new Set([...buildings, ...system.buildings])) {
      costs[building as BuildingName] = Object.entries(getCosts('buildings', building, buildingVariables)) as [ResourceName, number][];
    }

    this.removeBuildings(system, removeBuildings, costs, empire);
    this.addBuildings(system, addBuildings, costs, empire);

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

  private removeBuildings(system: SystemDocument, removeBuilings: Partial<Record<BuildingName, number>>, costs: Record<BuildingName, [ResourceName, number][]>, empire: EmpireDocument) {
    //Remove buildings and refund half of the cost
    for (const [building, amount] of Object.entries(removeBuilings)) {
      const bName = building as BuildingName;
      const cost: [ResourceName, number][] = costs[bName];

      for (let i = 0; i < amount; i++) {
        system.buildings.splice(system.buildings.indexOf(bName), 1);

        for (const [resource, resourceCost] of cost) {
          empire.resources[resource as ResourceName] += resourceCost / 2;
        }

        empire.markModified('resources');
      }
    }
  }

  private addBuildings(system: SystemDocument, addBuildings: Partial<Record<BuildingName, number>>, costs: Record<BuildingName, [ResourceName, number][]>, empire: EmpireDocument) {
    //Check if there is enough capacity to build the new buildings
    const capacityLeft = system.capacity - Object.values(system.districts).sum() - system.buildings.length;
    if (capacityLeft <= 0) {
      throw new BadRequestException(`Not enough capacity to build buildings. Capacity left: ${capacityLeft} Amount of new buildings: ${Object.values(addBuildings).sum()}`);
    }

    //Check if there are enough resources to build the new buildings
    for (const [building, amount] of Object.entries(addBuildings)) {
      const cost: [ResourceName, number][] = costs[building as BuildingName];

      for (let i = 0; i < amount; i++) {
        if (!cost.every(([resource, amount]) => empire.resources[resource as ResourceName] >= amount)) {
          throw new BadRequestException(`Not enough resources to build a ${building}`);
        }
      }
    }

    //Add buildings and remove resources
    for (const [building, amount] of Object.entries(addBuildings)) {
      const bName = building as BuildingName;
      const cost: [ResourceName, number][] = costs[building as BuildingName];

      for (let i = 0; i < amount; i++) {
        system.buildings.push(bName);
        cost.forEach(([resource, amount]) => empire.resources[resource as ResourceName] -= amount);
        empire.markModified('resources');
      }
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

  private applyCosts(empire: EmpireDocument, upgrade: SystemUpgradeName) {
    const costs = Object.entries(SYSTEM_UPGRADES[upgrade].cost);

    if (costs.every(([resource, amount]) => empire.resources[resource as ResourceName] >= amount)) {
      for (const [resource, amount] of Object.entries(SYSTEM_UPGRADES[upgrade].cost)) {
        empire.resources[resource as ResourceName] -= amount;
      }
      empire.markModified('resources');
    } else {
      throw new BadRequestException(`Not enough resources to upgrade system`);
    }
  }

  async generateMap(game: Game): Promise<SystemDocument[]> {
    return this.createMany(this.systemGenerator.generateMap(game));
  }

  private async emit(event: string, system: System) {
    const members = await this.memberService.findAll({game: system.game}, {projection: {user: 1}});
    // TODO mask population, districts and buildings
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system, members.map(m => m.user.toString()));
  }
}
