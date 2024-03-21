import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemDocument} from './system.schema';
import {Game} from "../game/game.schema";
import {UpdateSystemDto} from './system.dto';
import {SYSTEM_UPGRADES, SystemUpgradeName} from '../game-logic/system-upgrade';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BuildingName} from '../game-logic/buildings';
import {SYSTEM_TYPES} from "../game-logic/system-types";
import {calculateVariables, getVariables} from "../game-logic/variables";
import {EmpireService} from "../empire/empire.service";
import {Empire, EmpireDocument} from "../empire/empire.schema";
import {District, Variable} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {SystemGeneratorService} from "./systemgenerator.service";

function getDistrictCost(district: DistrictName, districtVariables: any) {
  const districtCostKeys = Object.keys(districtVariables).filter(key =>
    key.startsWith(`districts.${district}.cost.`)
  );

  const cost: any = {};
  districtCostKeys.forEach(key => {
    const resource = key.split('.').pop() as ResourceName;
    cost[resource] = districtVariables[key];
  });
  return cost;
}

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
    private empireService: EmpireService,
    private systemGenerator: SystemGeneratorService,
  ) {
    super(model);
  }

  async updateSystem(system: SystemDocument, dto: UpdateSystemDto): Promise<SystemDocument | null> {
    if (dto.upgrade) {
      await this.upgradeSystem(system, dto.upgrade, dto.owner);
    }
    if (dto.districts) {
      await this.updateDistricts(system, dto.districts);
    }
    if (dto.buildings) {
      this.updateBuildings(system, dto.buildings);
    }
    await this.saveAll([system]) // emits update events
    return system;
  }

  private async upgradeSystem(system: SystemDocument, upgrade: SystemUpgradeName, owner?: Types.ObjectId) {
    system.upgrade = upgrade;
    system.capacity *= SYSTEM_UPGRADES[upgrade].capacity_multiplier;

    if (!owner) {
      throw new BadRequestException(`Owner required to explore system`);
    }

    const empire = await this.empireService.find(owner);
    if (!empire) {
      throw new BadRequestException(`Empire ${owner} not found`);
    }

    switch (upgrade) {
      case 'explored':
        this.generateDistricts(system, empire);
        break;
      case 'colonized':
        system.owner = owner;
        this.applyCosts(empire, upgrade);
        break;
      case 'upgraded':
      case 'developed':
        this.applyCosts(empire, upgrade);
        break;
    }

    await this.empireService.saveAll([empire]);
  }

  private async updateDistricts(system: SystemDocument, districts: Partial<Record<DistrictName, number>>) {
    const districtVariables = getVariables('districts');
    const districtSlots = {...system.districtSlots};
    const allDistricts = {...system.districts};
    let builtDistrictsCount = 0;
    let amountOfDistrictsToBeBuilt = 0;
    let empire = null;

    if (system.owner !== undefined && Types.ObjectId.isValid(system.owner)) {
      empire = await this.empireService.find(system.owner);
    }
    if (!empire) {
      throw new BadRequestException(`Empire ${system.owner} not found`);
    }
    calculateVariables(districtVariables, empire);

    for (const [district, amount] of Object.entries(districts)) {
      if (amount === 0) {
        continue;
      }
      const districtName = district as DistrictName;
      const districtTypeSlots = districtSlots[districtName];
      const builtDistrictsOfType = allDistricts[districtName] ?? 0;
      builtDistrictsCount += builtDistrictsOfType;
      amountOfDistrictsToBeBuilt += amount ?? 0;

      // Check if districts don't exceed slots
      if (districtTypeSlots !== undefined && districtTypeSlots - builtDistrictsOfType < amount) {
        throw new ConflictException(`Insufficient district slots for ${districtName}`);
      }

      // Check if empire has enough resource to buy the district or the given amount is negative to refund resources
      const districtCost: Record<ResourceName, number> = getDistrictCost(districtName, districtVariables);
      const empireResources: Record<ResourceName, number> = empire.resources;
      for (const resource of Object.keys(districtCost)) {
        const cost = districtCost[resource as ResourceName];
        const empireResourceAmount = empireResources[resource as ResourceName];
        if (empireResourceAmount === undefined || empireResourceAmount < cost * amount) {
          throw new ConflictException(`Empire ${empire._id} has not enough ${resource} to buy the district`);
        } else {
          if (amount > 0) {
            empire.resources[resource as ResourceName] -= cost * amount;
          } else {
            console.log(builtDistrictsCount, amount);
            if (builtDistrictsCount < Math.abs(amount)) {
              throw new ConflictException(`Not enough districts of ${districtName} to destroy`);
            }
            empire.resources[resource as ResourceName] -= cost * amount / 2;
          }
          empire.markModified('resources');
        }
      }
    }

    // Check if district slots don't exceed capacity
    if (system.buildings.length + builtDistrictsCount + amountOfDistrictsToBeBuilt > Math.round(system.capacity)) {
      throw new ConflictException(`System ${system._id} has not enough capacity to build the districts`);
    }

    // ADRIAN'S PERFECT CODE
    for (const [district, amount] of Object.entries(districts)) {
      const districtName = district as DistrictName;
      system.districts[districtName] = (system.districts[districtName] ?? 0) + amount;
    }
    system.markModified('districts');
    await this.empireService.saveAll([empire]);
  }

  private updateBuildings(system: SystemDocument, buildings: BuildingName[]) {
    // TODO @Giulcoo: #17 Build and Destroy Buildings
    //  - Determine new and removed buildings
    //  - Check costs and resources
    //  - Check if buildings don't exceed capacity
    system.buildings = buildings;
  }

  generateDistricts(system: SystemDocument, empire: Empire) {
    //Get district chances for this system type
    const districtChances: Partial<Record<Variable, number>> = {};

    for (const [key, value] of Object.entries(DISTRICTS)) {
      const chance: District['chance'] = value.chance;
      districtChances[`districts.${key}.chance.${system.type}` as Variable] = chance[system.type] ?? value.chance.default;
    }

    calculateVariables(districtChances, empire);

    //Generate random districts depending on the chances
    this.randomDistricts(system, districtChances);
  }

  private randomDistricts(system: SystemDocument, districtChances: Partial<Record<Variable, number>>) {
    const nDistricts = SYSTEM_TYPES[system.type].district_percentage * system.capacity;
    for (let i = 0; i < nDistricts; i++) {
      const type = Object.entries(districtChances).randomWeighted(i => i[1])[0] as Variable;

      const district = type.split('.')[1] as DistrictName;
      if (system.districtSlots[district]) {
        system.districtSlots[district]!++;
      } else {
        system.districtSlots[district] = 1;
      }
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

  private emit(event: string, system: System): void {
    // TODO mask population, districts and buildings
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system);
  }
}
