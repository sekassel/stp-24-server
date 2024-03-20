import {Game} from "../game/game.schema";
import {System} from "./system.schema";
import {CIRCLE_GENERATOR, GRID_SCALING} from "../game-logic/gridtypes";
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
      let radius = avgRadius;

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

    return clusters.flat();
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
      }
      else{
        edges.pop();
      }
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

  /**
   * Connects the two nearest systems of two clusters
   * */
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

    this.clusterGenerator.connectSystems(nearestSystems[0], nearestSystems[1]);
  }
}
