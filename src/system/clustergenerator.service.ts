import {Game} from "../game/game.schema";
import {System} from "./system.schema";
import {Grid, GRIDS, MAX_SYSTEM_DISPLACEMENT, Vertex} from "../game-logic/gridtypes";
import {SYSTEM_TYPES, SystemTypeName} from "../game-logic/system-types";
import {Types} from "mongoose";
import {SYSTEM_UPGRADE_NAMES} from "../game-logic/system-upgrade";

export class ClusterGeneratorService {
  /**
   * Creates a cluster of systems and connects these systems
   */
  generateCluster(game: Game, scaling: number, offset: number[]): System[] {
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

  /**
   * Creates a spanning tree using Prim's algorithm
   * @param grid The grid to create the tree on
   * @param vertices The vertices on the grid to create the tree with
   * @private
   */
  private createSpanningTree(grid: Grid, vertices: number[]): number[][] {
    const edges: number[][] = [];

    //Start with a random vertex
    const visited = [vertices[Math.randInt(vertices.length)]];

    //Repeat until all vertices are visited
    while(visited.length < vertices.length) {
      const candidateEdges = []; //Edges that can be added to the tree

      for(const vertex of visited) {
        const validNeighborEdges = grid.vertices[vertex].neighbors
          .filter(neighbor => vertices.includes(neighbor) && !visited.includes(neighbor))
          .map(neighbor => vertex > neighbor ? [neighbor, vertex] : [vertex, neighbor])
          .filter(edge => !this.hasCycle(vertex, edges) && !this.hasIntersection(grid, edges, edge));

        candidateEdges.push(...validNeighborEdges);
      }

      const newEdge = candidateEdges[Math.randInt(candidateEdges.length)];
      edges.push(newEdge); //Add the edge to the tree
      visited.push(newEdge.find(vertex => !visited.includes(vertex))!); //Add the new vertex to the visited list
    }

    return edges;
  }

  /**
   * Checks if a system is part of a cycle in a cluster of systems
   * */
  hasCycle(start: number, edges: number[][]): boolean {
    const firstEdge = edges.filter(edge => edge.includes(start)).random();
    if (!firstEdge) return false;

    const visited: number[][] = [firstEdge];
    const stack: number[] = [firstEdge[0] === start ? firstEdge[1] : firstEdge[0]];

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
    return edges.some(edge => this.isEdgesIntersecting(grid, edge, newEdge) || this.isEdgesIntersecting(grid, newEdge, edge));
  }

  private isEdgesIntersecting(grid: Grid, edge1: number[], edge2: number[]): boolean {
    for(const intersectingEdges of grid.intersecting_edges) {
      if((intersectingEdges[0][0] == edge1[0] && intersectingEdges[0][1] == edge1[1]
        && intersectingEdges[1][0] == edge2[0] && intersectingEdges[1][1] == edge2[1])) return true;
    }

    return false;
  }

  nearestSystems(cluster1:System[], cluster2: System[]): System[]{
    let nearestSystems: System[] = [];
    let nearestSystemDistance = Infinity;

    for(const system1 of cluster1){
      for(const system2 of cluster2){
        const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
        if(distance < nearestSystemDistance){
          nearestSystems = [system1, system2];
          nearestSystemDistance = distance;
        }
      }
    }

    return nearestSystems;
  }

  connectSystems(system1: System, system2: System): void {
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
      // NB @Gio: this is not the same as the game owner (the host, a user id),
      // this is the ingame empire that owns the system
      owner: undefined,
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
}
