import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemUpgradeLevel} from './system.schema';
import {Game} from "../game/game.schema";

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
  ) {
    super(model);
  }

  async generateMap(game: Game): Promise<void> {
    if(!game.settings?.size) return;

    const clusters: System[][] = [];

    //TODO: Generate multiple clusters
    clusters.push(this.createCluster(game, 10, 100, [0, 0]));

    //TODO: Connect clusters

    await this.createMany(clusters.flat());
  }

  /**
   * Creates a cluster of systems and connects these systems
   */
  private createCluster(game: Game, count: number, radius: number, center: number[]): System[] {
    const systems: System[] = [];

    //Create systems
    const angleStep = 2 * Math.PI / count;
    let angle = 0;
    while(angle < 2 * Math.PI) {
      const distance = Math.random() * radius;
      const system: System = {
        _id: new Types.ObjectId(),
        game: game._id,
        owner: game.owner,
        capacity: Math.floor(Math.random() * 100) + 100,
        type: 'regular',
        x: center[0] + distance * Math.cos(angle),
        y: center[1] + distance * Math.sin(angle),
        upgrade: SystemUpgradeLevel.unexplored,
        links: {},
        districtSlots: {},
        districts: {},
        buildings: [],
        population: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      angle += angleStep;
      systems.push(system);
    }

    //Connect systems as a spanning tree
    for(let i = 0; i < systems.length; i++) {
      const start = Math.randInt(systems.length);

      for(let add = 0; i < systems.length; i++) {
        const j = (start + add) % systems.length;

        if(i != j){
          this.connectSystems(systems[i], systems[j]);

          if(this.checkForCycles(systems, systems[i])) {
            this.removeConnection(systems[i], systems[j]);
          } else{
            break;
          }
        }
      }
    }

    //Add random cycle
    const randomCycles = Math.randInt(count/10);
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

  private connectSystems(system1: System, system2: System): void {
    const distance = Math.hypot(system1.x - system2.x, system1.y - system2.y);
    system1.links[system2._id.toString()] = distance;
    system2.links[system1._id.toString()] = distance;
  }

  private removeConnection(system1: System, system2: System): void {
    delete system1.links[system2._id.toString()];
    delete system2.links[system1._id.toString()];
  }

  private emit(event: string, system: System): void {
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system);
  }
}
