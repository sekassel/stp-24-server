import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System,SystemDocument} from './system.schema';
import {Game} from "../game/game.schema";
import {GRIDS} from "../game-logic/gridtypes";
import {UpdateSystemDto} from './system.dto';
import {
  SYSTEM_UPGRADE_NAMES,
  SYSTEM_UPGRADES,
  SystemUpgradeName
} from '../game-logic/system-upgrade';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BuildingName} from '../game-logic/buildings';
import {SYSTEM_TYPES, SystemType} from "../game-logic/system-types";
import {calculateVariables} from "../game-logic/variables";
import {EmpireService} from "../empire/empire.service";
import {Empire, EmpireDocument} from "../empire/empire.schema";
import {District, Variable} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
    private empireService: EmpireService,
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
      this.updateBuildings(system, dto.buildings);
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
    // TODO @Giulcoo: https://github.com/sekassel-research/stp-24-server/issues/15
    //   - Check costs and resources
    //   - Check if districts don't exceed capacity
    //   - Check if districts don't exceed slots
    for (const [district, amount] of Object.entries(districts)) {
      system.$inc(`districts.${district}`, amount);
    }
  }

  private updateBuildings(system: SystemDocument, buildings: BuildingName[]) {
    // TODO @Giulcoo: https://github.com/sekassel-research/stp-24-server/issues/17
    system.buildings = buildings;
  }

  private generateDistricts(system: SystemDocument, empire: Empire){
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
      districtChances[type] && districtChances[type]!--;

      const district = type.split('.')[1] as DistrictName;
      if(system.districtSlots[district]){
        system.districtSlots[district]!++;
      }
      else{
        system.districtSlots[district] = 1;
      }
    }
  }

  private applyCosts(empire: EmpireDocument, upgrade: SystemUpgradeName){
    const costs = Object.entries(SYSTEM_UPGRADES[upgrade].cost);

    if(costs.every(([resource, amount]) => empire.resources[resource as ResourceName] >= amount)){
      for(const [resource, amount] of Object.entries(SYSTEM_UPGRADES[upgrade].cost)){
        empire.resources[resource as ResourceName] -= amount;
      }
    }
    else{
      throw new BadRequestException(`Not enough resources to upgrade system`);
    }
  }

  async generateMap(game: Game): Promise<void> {
    if(!game.settings?.size) return;

    const clusters: System[][] = [];

    //TODO: Generate multiple clusters
    clusters.push(this.createCluster(game, 15, [-40, -40]));

    //TODO: Connect clusters

    await this.createMany(clusters.flat());
  }

  /**
   * Creates a cluster of systems and connects these systems
   */
  // private createCluster(game: Game, count: number, radius: number, center: number[]): System[] {
  private createCluster(game: Game, scaling: number, offset: number[]): System[] {
    const systems: System[] = [];

    //Create systems
    const grid:number[][] = GRIDS[Math.randInt(GRIDS.length)].sort(() => Math.random() - 0.5).slice(0, 10);

    for(const [x, y] of grid) {
      systems.push(this.createSystem(game, (x + Math.random()*0.25) * scaling + offset[0], (y + Math.random()*0.25) * scaling + offset[1]));
    }

    //Connect systems as a spanning tree
    const visitedSystems: System[] = [systems[0]];
    while(visitedSystems.length < systems.length) {
      let nextSystem: System | undefined = undefined;
      for(const system of this.edgesSortedSystems(visitedSystems)){
        if(Math.random() < 0.3){
          nextSystem = system;
          break;
        }
      }

      if(!nextSystem) nextSystem = visitedSystems[Math.randInt(visitedSystems.length)];

      const candidates = this.distanceSortedSystems(systems.filter(s => !visitedSystems.includes(s)), nextSystem);

      for(const otherSystem of candidates) {
        this.connectSystems(nextSystem, otherSystem);

        if(this.checkForCycles(systems, nextSystem)) {
          this.removeConnection(nextSystem, otherSystem);
        } else{
          visitedSystems.push(otherSystem);
          break;
        }
      }
    }

    //Add random cycle
    //const randomCycles = Math.randInt(count/10);
    const randomCycles = 0;
    for(let i = 0; i < randomCycles; i++) {
      const system1 = systems[Math.randInt(systems.length)];
      const system2 = systems[Math.randInt(systems.length)];

      if(system1 != system2) this.connectSystems(system1, system2);
    }

    return systems;
  }

  /**
   * Checks if a system is part of a cycle in a cluster of systems
   * */
  private checkForCycles(systems: System[], start: System): boolean {
    const systemsCopy: System[] = [];
    for(const system of systems) {
      const copy = new System();
      copy._id = system._id;
      copy.links = {...system.links};
      systemsCopy.push(copy);
    }

    const startCopy = new System();
    startCopy._id = start._id;
    startCopy.links = {...start.links};

    const stack:System[] = [];

    for(const link of Object.keys(startCopy.links)) {
      const neighbors = systemsCopy.filter(system => system._id.toString() === link);
      neighbors.forEach(neighbor => this.removeConnection(startCopy, neighbor));
      stack.push(...neighbors);
    }

    while(stack.length > 0) {
      const current = stack.pop();
      if(!current) break;

      if(current == start) return true;

      for(const link in current.links) {
        const neighbors = systemsCopy.filter(system => system._id.toString() === link);
        neighbors.forEach(neighbor => this.removeConnection(current, neighbor));
        stack.push(...neighbors);
      }
    }
    return false;
  }

  private distanceSortedSystems(systems: System[], system: System): System[] {
    return systems.sort((a, b) => {
      const distanceA = Math.hypot(a.x - system.x, a.y - system.y);
      const distanceB = Math.hypot(b.x - system.x, b.y - system.y);
      return distanceA - distanceB;
    }).filter(s => s != system);
  }

  private edgesSortedSystems(systems: System[]): System[] {
    return systems.sort((a, b) => Object.keys(a.links).length - Object.keys(b.links).length);
  }

  private connectSystems(system1: System, system2: System): void {
    const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
    system1.links[system2._id.toString()] = distance;
    system2.links[system1._id.toString()] = distance;
  }

  private removeConnection(system1: System, system2: System): void {
    delete system1.links[system2._id.toString()];
    delete system2.links[system1._id.toString()];
  }

  private createSystem(game: Game, x: number, y: number): System {
    const systemType = Object.entries(SYSTEM_TYPES).randomWeighted(([, value]) => value.chance)[0] as SystemType;
    const capacity_range = SYSTEM_TYPES[systemType].capacity_range;

    return {
      _id: new Types.ObjectId(),
      game: game._id,
      owner: game.owner,
      type: systemType,
      capacity: Math.randInt(capacity_range[1] - capacity_range[0]) + capacity_range[0],
      x: x,
      y: y,
      upgrade: SYSTEM_UPGRADE_NAMES[0],
      links: {},
      districtSlots: {},
      districts: {},
      buildings: [],
      population: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  private emit(event: string, system: System): void {
    // TODO mask population, districts and buildings
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system);
  }
}
