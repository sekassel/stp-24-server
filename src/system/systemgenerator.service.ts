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

    return this.removeIntersectingEdges(clusters.flat());
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
    const edges: number[][] = [];
    let cycleEdges: number[][] = [];
    let edgesMassCenter:number[] = [];

    //Connect clusters as a spanning tree
    let queue: number[][] = [];
    for(let i = 0; i < clusters.length; i++){
      for(let j = 0; j < clusters.length; j++){
        if(i !== j && i < j) queue.push([i,j]);
      }
    }
    queue = this.sortEdgesByLength(centers, queue, maxDistance);

    while (queue.length > 0) {
      const edge = queue.shift()!;

      edges.push(edge);
      if(!this.hasCycle(edge, edges)){
        this.connectCluster(clusters[edge[0]], clusters[edge[1]]);

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
        cycleEdges.push(edge);
      }
    }

    //Add random cycle edges
    for(let i = 0; i < clusters.length * MAP_CYCLE_PERCENTAGE; i++){
      if(cycleEdges.length == 0) break;
      cycleEdges = this.sortEdgesByDistanceFromPoint(centers, cycleEdges, edgesMassCenter);
      const edge = cycleEdges.pop()!;
      const edgeCenter = [(centers[edge[0]][0] + centers[edge[1]][0])/2, (centers[edge[0]][1] + centers[edge[1]][1])/2];

      this.connectCluster(clusters[edge[0]], clusters[edge[1]]);
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
  private connectCluster(cluster1: System[], cluster2: System[]) {
    let nearestSystems: System[] = [];
    let nearestSystemDistance = -1;

    for(const system1 of cluster1){
      for(const system2 of cluster2){
        const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
        if(nearestSystemDistance === -1 || distance < nearestSystemDistance){
          nearestSystems = [system1, system2];
          nearestSystemDistance = distance;
        }
      }
    }

    this.clusterGenerator.connectSystems(nearestSystems[0], nearestSystems[1]);
  }

  private removeIntersectingEdges(systems: System[]): System[] {
    for(let i = 0; i < systems.length; i++) {
      for(let j = i+1; j < systems.length; j++) {
        this.checkLinks(systems, i, j);
      }
    }

    return systems;
  }

  /**
   * Checks if two systems have links that intersect with each other
   */
  private checkLinks(systems: System[], system1: number, system2: number) {
    const links1:System[][] = Array.from(Object.keys(systems[system1].links).map(key => {
      const otherSystem = systems.find(system => system._id.toString() === key)!;
      return [systems[system1], otherSystem];
    }));

    for(const key of Object.keys(systems[system2].links)){
      const system = systems.find(system => system._id.toString() === key)!;
      if(system._id.toString() === systems[system1]._id.toString()) continue;

      const link2 = [systems[system2], system];
      const link1 = links1.find(link1 =>
        link1[1]._id.toString() !== system._id.toString() && link1[1]._id.toString() !== systems[system2]._id.toString() && this.isEdgesIntersecting(link1, link2));

      if(link1){
        this.removeLink(systems[system2], system);
        break;
      }
    }
  }

  private isEdgesIntersecting(link1: System[], link2: System[]): boolean {
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
}
