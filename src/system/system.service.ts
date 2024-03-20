import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System,SystemDocument} from './system.schema';
import {Game} from "../game/game.schema";
import {CIRCLE_GENERATOR, GRID_SCALING, GRIDS, Grid, Vertex, MAX_SYSTEM_DISPLACEMENT} from "../game-logic/gridtypes";
import {UpdateSystemDto} from './system.dto';
import {
  SYSTEM_UPGRADE_NAMES,
  SYSTEM_UPGRADES,
  SystemUpgradeName
} from '../game-logic/system-upgrade';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BuildingName} from '../game-logic/buildings';
import {SYSTEM_TYPES, SystemTypeName} from "../game-logic/system-types";
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

  private updateBuildings(system: SystemDocument, buildings: BuildingName[]) {
    // TODO @Giulcoo: #17 Build and Destroy Buildings
    //  - Determine new and removed buildings
    //  - Check costs and resources
    //  - Check if buildings don't exceed capacity
    system.buildings = buildings;
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
    if(!game.settings?.size) {
      return [];
    }

    const clusters: System[][] = [];
    const clustersCenter: number[][] = [];
    const clustersRadius: number[] = [];
    let avgRadius = -1;

    //Create clusters
    while(clusters.flat().length < game.settings.size){
      const cluster = this.createCluster(game, GRID_SCALING, [-GRID_SCALING*2,-GRID_SCALING*2]);
      const center = this.calcClusterCenter(cluster);
      const radius = this.calcClusterRadius(cluster, center);

      clusters.push(cluster);
      clustersCenter.push(center);
      clustersRadius.push(radius);

      if (avgRadius === -1) {
        avgRadius = radius;
      }
      else {
        avgRadius = (avgRadius + radius) / 2;
      }
    }


    //Spread clusters across the map
    for(let i = 1; i < clusters.length; i++){
      let angle = 0;
      let angleOffset = Math.PI*2*Math.random()
      let radius = avgRadius;

      while(this.hasClusterCollision(clustersCenter, clustersRadius, i)){
        angle += Math.PI/(radius * CIRCLE_GENERATOR.radius_angle_percentage + CIRCLE_GENERATOR.angle_steps);

        if(angle > Math.PI*2){
          angle = 0;
          angleOffset = Math.PI*2*Math.random();
          radius += avgRadius * CIRCLE_GENERATOR.radius_steps;
        }

        const movement = [Math.cos(angle + angleOffset)*radius, Math.sin(angle + angleOffset)*radius];
        clusters[i] = this.moveCluster(clusters[i], movement);
        clustersCenter[i] = [clustersCenter[i][0] + movement[0], clustersCenter[i][1] + movement[1]];
      }
    }

    //Connect clusters


    return this.createMany(clusters.flat());
  }

  private moveCluster(cluster: System[], movement: number[]): System[] {
    return cluster.map(system => {
      system.x += movement[0];
      system.y += movement[1];
      return system;
    });
  }

  private hasClusterCollision(clusterCenters: number[][], clusterRadius: number[], clusterIndex: number): boolean {
    for(let i = 0; i < clusterCenters.length; i++){
      if(i === clusterIndex) continue;
      if(this.clusterCollision(clusterCenters[i], clusterCenters[clusterIndex],
        clusterRadius[i]*CIRCLE_GENERATOR["collision_precision"],
        clusterRadius[clusterIndex]*CIRCLE_GENERATOR["collision_precision"])) return true;
    }
    return false;
  }

  private clusterCollision(center1: number[], center2: number[], radius1: number, radius2: number): boolean {
    return Math.hypot(center1[0] - center2[0], center1[1] - center2[1]) < radius1 + radius2;
  }

  /**
   * Creates a cluster of systems and connects these systems
   */
  private createCluster(game: Game, scaling: number, offset: number[]): System[] {
    const grid:Grid = GRIDS[Math.randInt(GRIDS.length)];
    const systemAmount = Math.randInt(grid.system_range[1] - grid.system_range[0]) + grid.system_range[0];
    const vertices: number[] = Array.from(grid.vertices.map(vertex => vertex.id)).sort(() => Math.random() - 0.5).slice(0, systemAmount);
    const edges: number[][] = this.createSpanningTree(grid, vertices);

    //Add random cycles
    const randomCycles = vertices.length * grid.cycle_percentage;
    for(let i = 0; i < randomCycles; i++) {
      const system1 = vertices[Math.randInt(vertices.length)];
      const neighbors = grid.vertices[system1].neighbors.filter(neighbor => vertices.includes(neighbor));
      const system2 = neighbors[Math.randInt(neighbors.length)];
      const newEdge = Array.from([system1, system2]).sort(v => v);

      if(!edges.includes(newEdge) && !this.hasIntersection(grid, edges, newEdge)){
        edges.push([system1, system2]);
      }
    }

    //Create systems
    const systems: Record<number, System> = {};
    vertices.forEach(vertex => systems[vertex] = this.createSystem(game, grid.vertices[vertex], scaling, offset));

    //Connect systems
    for(const [system1, system2] of edges) {
      this.connectSystems(systems[system1], systems[system2]);
    }


    return Object.values(systems);
  }

  private createSpanningTree(grid: Grid, vertices: number[]): number[][] {
    const edges: number[][] = [];

    const visited = [vertices[Math.randInt(vertices.length)]];

    while(visited.length < vertices.length) {
      const candidateEdges = [];

      for(const vertex of visited) {
        const validNeighborEdges = grid.vertices[vertex].neighbors
          .filter(neighbor => vertices.includes(neighbor) && !visited.includes(neighbor))
          .map(neighbor => vertex > neighbor ? [neighbor, vertex] : [vertex, neighbor])
          .filter(edge => !this.hasCycle(vertex, edges) && !this.hasIntersection(grid, edges, edge));

        candidateEdges.push(...validNeighborEdges);
      }

      const newEdge = candidateEdges[Math.randInt(candidateEdges.length)];
      edges.push(newEdge);
      visited.push(newEdge.find(vertex => !visited.includes(vertex))!);
    }

    return edges;
  }

  private calcClusterCenter(cluster: System[]): number[] {
    const x = cluster.reduce((acc, system) => acc + system.x, 0) / cluster.length;
    const y = cluster.reduce((acc, system) => acc + system.y, 0) / cluster.length;
    return [x, y];
  }

  private calcClusterRadius(cluster: System[], center: number[]): number {
    return cluster.reduce((acc, system) => Math.max(acc, Math.hypot(system.x - center[0], system.y - center[1])), 0);
  }

  private connectCluster(cluster1: System[], cluster2: System[]) {
    let nearestSystems: System[] = [];
    let nearesSystemDistance = -1;

    for(const system1 of cluster1){
      for(const system2 of cluster2){
        const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
        if(nearesSystemDistance === -1 || distance < nearesSystemDistance){
          nearestSystems = [system1, system2];
          nearesSystemDistance = distance;
        }
      }
    }

    this.connectSystems(nearestSystems[0], nearestSystems[1]);
  }

  /**
   * Checks if a system is part of a cycle in a cluster of systems
   * */
  private hasCycle(start: number, edges: number[][]): boolean {
    const visited: number[][] = edges.filter(edge => edge.includes(start));
    const stack: number[] = visited.map(edge => edge[0] === start ? edge[1] : edge[0]);

    while (stack.length > 0) {
      const current = stack.pop();
      if(!current) break;

      for(const edge of edges.filter(edge => !visited.includes(edge))) {
        if(edge[0] === current) {
          if(edge[1] === start) return true;
          visited.push(edge);
          stack.push(edge[1]);
        }
        else if(edge[1] === current) {
          if(edge[0] === start) return true;
          visited.push(edge);
          stack.push(edge[0]);
        }
      }
    }

    return false;
  }

  private hasIntersection(grid: Grid, edges: number[][], newEdge: number[]): boolean {
    return edges.some(edge => this.isIntersecting(grid, edge, newEdge) || this.isIntersecting(grid, newEdge, edge));
  }

  private isIntersecting(grid: Grid, edge1: number[], edge2: number[]): boolean {
    for(const intersectingEdges of grid.intersecting_edges) {
      if((intersectingEdges[0][0] == edge1[0] && intersectingEdges[0][1] == edge1[1]
        && intersectingEdges[1][0] == edge2[0] && intersectingEdges[1][1] == edge2[1])) return true;
    }

    return false;
  }

  private connectSystems(system1: System, system2: System): void {
    const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
    system1.links[system2._id.toString()] = distance;
    system2.links[system1._id.toString()] = distance;
  }

  private createSystem(game: Game, vertex: Vertex, scaling: number, offset: number[]): System {
    const systemType = Object.entries(SYSTEM_TYPES).randomWeighted(([, value]) => value.chance)[0] as SystemTypeName;
    const capacity_range = SYSTEM_TYPES[systemType].capacity_range;

    return {
      _id: new Types.ObjectId(),
      game: game._id,
      owner: game.owner,
      type: systemType,
      capacity: Math.randInt(capacity_range[1] - capacity_range[0]) + capacity_range[0],
      x: vertex.x * scaling + offset[0] + Math.random() * scaling * MAX_SYSTEM_DISPLACEMENT,
      y: vertex.y * scaling + offset[1] + Math.random() * scaling * MAX_SYSTEM_DISPLACEMENT,
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
