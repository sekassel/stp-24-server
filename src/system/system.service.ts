import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemDocument} from './system.schema';
import {Game} from "../game/game.schema";
import {UpdateSystemDto} from './system.dto';
import {SYSTEM_UPGRADES, SystemUpgradeName} from '../game-logic/system-upgrade';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BUILDING_NAMES, BuildingName, BUILDINGS} from '../game-logic/buildings';
import {SYSTEM_TYPES} from "../game-logic/system-types";
import {calculateVariables} from "../game-logic/variables";
import {EmpireService} from "../empire/empire.service";
import {Empire, EmpireDocument} from "../empire/empire.schema";
import {District, Variable} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {SystemGeneratorService} from "./systemgenerator.service";

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
      this.updateDistricts(system, dto.districts);
    }
    if (dto.buildings) {
      await this.updateBuildings(system, dto.buildings, dto.owner);
    }
    await this.saveAll([system]) // emits update events
    return system;
  }

  private async upgradeSystem(system: SystemDocument, upgrade: SystemUpgradeName, owner?: Types.ObjectId) {
    system.upgrade = upgrade;
    system.capacity *= SYSTEM_UPGRADES[upgrade].capacity_multiplier;

    if(!owner){
      throw new BadRequestException(`Owner required to explore system`);
    }

    const empire = await this.empireService.find(owner);
    if(!empire){
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

  private updateDistricts(system: SystemDocument, districts: Partial<Record<DistrictName, number>>) {
    // TODO @Simolse: #15 Build and Destroy Districts
    //   - Check costs and resources
    //   - Check if districts don't exceed capacity
    //   - Check if districts don't exceed slots
    for (const [district, amount] of Object.entries(districts)) {
      const districtName = district as DistrictName;
      system.districts[districtName] = (system.districts[districtName] ?? 0) + amount;
    }
    system.markModified('districts');
  }

  private async updateBuildings(system: SystemDocument, buildings: BuildingName[], owner?: Types.ObjectId) {
    if(!owner){
      throw new BadRequestException(`Owner required to update buildings`);
    }

    const empire = await this.empireService.find(owner);
    if(!empire){
      throw new BadRequestException(`Empire ${owner} not found`);
    }

    const oldBuildings = this.buildingsOccurrences(system.buildings);
    const newBuildings = this.buildingsOccurrences(buildings);

    //Find out which buildings to remove and add
    const removeBuilings: Partial<Record<BuildingName, number>> = {};
    const addBuildings: Partial<Record<BuildingName, number>> = {};
    Object.entries(oldBuildings).forEach(([building, amount]) => {
      const bName = building as BuildingName;

      if(newBuildings[bName] < amount){
        removeBuilings[bName] = amount - newBuildings[bName];
      }
      else if(newBuildings[bName] > amount){
        addBuildings[bName] = newBuildings[bName] - amount;
      }
    });

    //Remove buildings and refund half of the cost
    for(const [building, amount] of Object.entries(removeBuilings)){
      const bName = building as BuildingName;
      const cost = BUILDINGS[bName].cost;

      for (let i = 0; i < amount; i++) {
        system.buildings.splice(system.buildings.indexOf(bName), 1);

        for(const [resource, amount] of Object.entries(cost)){
          empire.resources[resource as ResourceName] += amount/2;
        }
      }
    }

    //Check if there is enough capacity to build the new buildings
    const capacityLeft = system.capacity - Object.values(system.districts).sum() + system.buildings.length;
    if(Object.values(addBuildings).sum() > capacityLeft){
      throw new BadRequestException(`Not enough capacity to build buildings. Capacity left: ${capacityLeft} Amount of new buildings: ${Object.values(addBuildings).sum()}`);
    }

    //Check if there are enough resources to build the new buildings
    for(const [building, amount] of Object.entries(addBuildings)){
      const cost = Object.entries(BUILDINGS[building as BuildingName].cost);

      for (let i = 0; i < amount; i++) {
        if(!cost.every(([resource, amount]) => empire.resources[resource as ResourceName] >= amount)){
          throw new BadRequestException(`Not enough resources to build a ${building}`);
        }
      }
    }

    //Add buildings and remove resources
    for(const [building, amount] of Object.entries(addBuildings)){
      const bName = building as BuildingName;
      const cost = Object.entries(BUILDINGS[bName].cost);

      for (let i = 0; i < amount; i++) {
        system.buildings.push(bName);
        cost.forEach(([resource, amount]) => empire.resources[resource as ResourceName] -= amount);
      }
    }

    await this.empireService.saveAll([empire]);
    system.buildings = buildings;
    system.markModified('buildings');
  }

  private buildingsOccurrences(buildings: BuildingName[]): Record<BuildingName, number> {
    const occurrences:Record<BuildingName, number> =
      Object.fromEntries(BUILDING_NAMES.map(building => [building as BuildingName, 0])) as Record<BuildingName, number>;

    buildings.forEach(building => occurrences[building]++);
    return occurrences;
  }

  generateDistricts(system: SystemDocument, empire: Empire){
    //Get district chances for this system type
    const districtChances: Partial<Record<Variable, number>> = {};

    for(const [key, value] of Object.entries(DISTRICTS)){
      const chance: District['chance'] = value.chance;
      districtChances[`districts.${key}.chance.${system.type}` as Variable] = chance[system.type] ?? value.chance.default;
    }

    calculateVariables(districtChances, empire);

    //Generate random districts depending on the chances
    this.randomDistricts(system, districtChances);
  }

  private randomDistricts(system: SystemDocument, districtChances: Partial<Record<Variable, number>>) {
    const nDistricts = SYSTEM_TYPES[system.type].district_percentage * system.capacity;
    for(let i = 0; i < nDistricts; i++){
      const type = Object.entries(districtChances).randomWeighted(i => i[1])[0] as Variable;

      const district = type.split('.')[1] as DistrictName;
      if(system.districtSlots[district]){
        system.districtSlots[district]!++;
      }
      else{
        system.districtSlots[district] = 1;
      }
    }
    system.markModified('districtSlots');
  }

  private applyCosts(empire: EmpireDocument, upgrade: SystemUpgradeName){
    const costs = Object.entries(SYSTEM_UPGRADES[upgrade].cost);

    if(costs.every(([resource, amount]) => empire.resources[resource as ResourceName] >= amount)){
      for(const [resource, amount] of Object.entries(SYSTEM_UPGRADES[upgrade].cost)){
        empire.resources[resource as ResourceName] -= amount;
      }
      empire.markModified('resources');
    }
    else{
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
