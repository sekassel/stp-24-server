import {Game} from "../game/game.schema";
import {System} from "./system.schema";
import {CIRCLE_GENERATOR, GRID_SCALING, MAP_CYCLE_PERCENTAGE} from "../game-logic/gridtypes";
import {ClusterGeneratorService} from "./clustergenerator.service";

export class SystemGeneratorService {
  constructor(
    private clusterGenerator: ClusterGeneratorService = new ClusterGeneratorService(),
  ) {
  }

  generateMap(game: Game): System[] {
    if(!game.settings?.size) {
      return [];
    }

    const clusters: System[][] = [];
    const clustersCenter: number[][] = [];
    const clustersRadius: number[] = [];
    let avgRadius = -1;

    //Create clusters
    while(clusters.flat().length < game.settings.size){
      const cluster = this.clusterGenerator.generateCluster(game, GRID_SCALING, [-GRID_SCALING*2,-GRID_SCALING*2]);
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
      let radius = avgRadius/2;

      while(this.hasClusterCollision(clustersCenter, clustersRadius, i)){
        angle += Math.PI/(radius * CIRCLE_GENERATOR.radius_angle_percentage + CIRCLE_GENERATOR.angle_steps);

        if(angle > Math.PI*2){
          angle = 0;
          angleOffset = Math.PI*2*Math.random();
          radius += avgRadius * CIRCLE_GENERATOR.radius_steps;
        }

        const newCenter = [Math.cos(angle + angleOffset)*radius, Math.sin(angle + angleOffset)*radius];
        const movement = [newCenter[0] - clustersCenter[i][0], newCenter[1] - clustersCenter[i][1]];
        clusters[i] = this.moveCluster(clusters[i], movement);
        clustersCenter[i] = [newCenter[0], newCenter[1]];
      }
    }

    //Connect clusters
    this.connectClusters(clusters, clustersCenter, avgRadius*3);

    // //Remove systems with no neighbors
    // for(let i = 0; i < clusters.length; i++){
    //   clusters[i] = clusters[i].filter(system => Object.keys(system.links).length > 0);
    // }

    return this.connectSingleSystems(clusters.flat());
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
        clusterRadius[i]*CIRCLE_GENERATOR.collision_precision,
        clusterRadius[clusterIndex]*CIRCLE_GENERATOR.collision_precision)) return true;
    }
    return false;
  }

  private clusterCollision(center1: number[], center2: number[], radius1: number, radius2: number): boolean {
    return Math.hypot(center1[0] - center2[0], center1[1] - center2[1]) < radius1 + radius2;
  }

  private calcClusterCenter(cluster: System[]): number[] {
    const x = cluster.reduce((acc, system) => acc + system.x, 0) / cluster.length;
    const y = cluster.reduce((acc, system) => acc + system.y, 0) / cluster.length;
    return [x, y];
  }

  private calcClusterRadius(cluster: System[], center: number[]): number {
    return cluster.reduce((acc, system) => Math.max(acc, Math.hypot(system.x - center[0], system.y - center[1])), 0);
  }

  private connectClusters(clusters: System[][], centers: number[][], maxDistance: number): void {
    //Create a queue with all possible edges between clusters
    let queue: number[][] = [];
    for(let i = 0; i < clusters.length; i++){
      for(let j = 0; j < clusters.length; j++){
        if(i !== j && i < j) queue.push([i,j]);
      }
    }

    //Sort the queue by length of the edges
    queue = this.sortEdgesByLength(centers, queue, maxDistance);

    //Connect clusters as a minimal spanning tree
    const edges: number[][] = []; //Edges of the spanning tree
    let cycleEdges: number[][] = []; //Edges that create a cycle
    let edgesMassCenter:number[] = []; //Mass center of the edges to avoid that all majority of the edges are at the same point of the map
    const newConnectedSystems: System[] = []; //Systems that will be connected by the new edges of the spanning tree

    //Repeat until all possible edges are checked
    while (queue.length > 0) {
      const edge = queue.shift()!;

      edges.push(edge);
      if(!this.hasCycle(edge, edges)){
        //The new edge doesn't create a cycle, so we connect the clusters
        if(this.connectCluster(clusters[edge[0]], clusters[edge[1]], newConnectedSystems)){
          //Calculate the mass center of the edges
          const edgeCenter = [(centers[edge[0]][0] + centers[edge[1]][0])/2, (centers[edge[0]][1] + centers[edge[1]][1])/2];
          if(edgesMassCenter.length == 0){
            edgesMassCenter = edgeCenter;
          }
          else{
            edgesMassCenter = [(edgesMassCenter[0] + edgeCenter[0])/2, (edgesMassCenter[1] + edgeCenter[1])/2];
          }
        }
        else{
          edges.pop();
        }
      }
      else{
        //The new edge creates a cycle, so we store it to the cycle edges and don't connect the clusters
        edges.pop();
        cycleEdges.push(edge);
      }
    }

    //Add random cycle edges
    for(let i = 0; i < clusters.length * MAP_CYCLE_PERCENTAGE; i++){
      if(cycleEdges.length == 0) break;
      //Sort the cycle edges by distance from the mass center of the edges, so that edges that are further away from the mass center are added first
      cycleEdges = this.sortEdgesByDistanceFromPoint(centers, cycleEdges, edgesMassCenter);
      const edge = cycleEdges.pop()!;
      const edgeCenter = [(centers[edge[0]][0] + centers[edge[1]][0])/2, (centers[edge[0]][1] + centers[edge[1]][1])/2];

      this.connectCluster(clusters[edge[0]], clusters[edge[1]], newConnectedSystems);
      edgesMassCenter = [(edgesMassCenter[0] + edgeCenter[0])/2, (edgesMassCenter[1] + edgeCenter[1])/2];
    }
  }

  private hasCycle(edge: number[], edges: number[][]): boolean {
    return this.clusterGenerator.hasCycle(edge[0], edges) || this.clusterGenerator.hasCycle(edge[1], edges);
  }

  private sortEdgesByLength(centers: number[][], edges: number[][], maxDistance: number): number[][] {
    return edges.sort((edge1, edge2) => {
      const edge1Length = Math.hypot(centers[edge1[0]][0] - centers[edge1[1]][0], centers[edge1[0]][1] - centers[edge1[1]][1]);
      const edge2Length = Math.hypot(centers[edge2[0]][0] - centers[edge2[1]][0], centers[edge2[0]][1] - centers[edge2[1]][1]);
      return edge1Length - edge2Length;
    }).filter(edge => Math.hypot(centers[edge[0]][0] - centers[edge[1]][0], centers[edge[0]][1] - centers[edge[1]][1]) < maxDistance);
  }

  private sortEdgesByDistanceFromPoint(centers: number[][], edges: number[][], point: number[]): number[][] {
    return edges.sort((edge1, edge2) => {
      const edge1Center = [(centers[edge1[0]][0] + centers[edge1[1]][0])/2, (centers[edge1[0]][1] + centers[edge1[1]][1])/2];
      const edge2Center = [(centers[edge2[0]][0] + centers[edge2[1]][0])/2, (centers[edge2[0]][1] + centers[edge2[1]][1])/2];

      const edge1Distance = Math.hypot(edge1Center[0] - point[0], edge1Center[1] - point[1]);
      const edge2Distance = Math.hypot(edge2Center[0] - point[0], edge2Center[1] - point[1]);
      return edge1Distance - edge2Distance;
    });
  }

  /**
   * Connects the two nearest systems of two clusters
   * */
  private connectCluster(cluster1: System[], cluster2: System[], connectedSystems: System[]) : boolean {
    const nearestSystems: System[] = this.clusterGenerator.nearestSystems(cluster1, cluster2);

    if(!this.isEdgeIntersecting(nearestSystems, connectedSystems)){
      connectedSystems.push(nearestSystems[0]);
      connectedSystems.push(nearestSystems[1]);
      this.clusterGenerator.connectSystems(nearestSystems[0], nearestSystems[1]);
      return true;
    }

    return false;
  }

  private isEdgeIntersecting(link: System[], systems: System[]) : boolean{
    for(let i = 0; i < systems.length; i++) {
      for(let j = i+1; j < systems.length; j++) {
        const link2 = [systems[i], systems[j]];
        if(link.includes(link2[0]) || link.includes(link2[1])) continue;

        if(this.areEdgesIntersecting(link, link2)) {
          return true;
        }
      }
    }

    return false;
  }

  private areEdgesIntersecting(link1: System[], link2: System[]): boolean {
    //https://www.jeffreythompson.org/collision-detection/line-line.php
    const x1 = link1[0].x;
    const y1 = link1[0].y;
    const x2 = link1[1].x;
    const y2 = link1[1].y;
    const x3 = link2[0].x;
    const y3 = link2[0].y;
    const x4 = link2[1].x;
    const y4 = link2[1].y;

    if(x1 === x2 && x3 === x4) return false;
    if(y1 === y2 && y3 === y4) return false;

    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
  }

  private removeLink(system1: System, system2: System) {
    delete system1.links[system2._id.toString()];
    delete system2.links[system1._id.toString()];
  }

  private connectSingleSystems(system: System[]): System[]{
    const unvisited: System[] = system;

    const visited: System[] = [];


    while(unvisited.length > 0){
      const nextUnvisited = unvisited[Math.randInt(unvisited.length)];

      //Check if this is not the first round of the loop
      if(visited.length != 0){
        //Connect the nearest systems of the new system to the existing connected systems
        const nearestSystems = this.clusterGenerator.nearestSystems([nextUnvisited], visited)
        this.clusterGenerator.connectSystems(nearestSystems[0], nearestSystems[1]);
      }

      const queue: System[] = [nextUnvisited];

      while (queue.length > 0) {
          const current = queue.shift();
          if (!current) break;

          //Add neighbors to the queue
          for(const neighbor of Object.keys(current.links)
            .map(id => system.find(s => s._id.toString() === id))
            .filter(s => s && !visited.includes(s)))
          {
            if(neighbor) queue.push(neighbor);
          }

          if(!visited.includes(current)){
            visited.push(current);
            unvisited.splice(unvisited.indexOf(current), 1);
          }
        }
    }

    return visited;
  }
}
