import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System} from './system.schema';
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
    clusters.push(await this.createCluster(game, 10, 100, [0, 0]));

    //TODO: Connect clusters

    clusters.forEach(cluster => {
      cluster.forEach(system => {
        this.update(system._id, system);
      });
    })
  }

  /**
   * Creates a cluster of systems and connects these systems
   */
  private async createCluster(game: Game, count: number, radius: number, center: number[]): Promise<System[]> {
    const systems: System[] = [];

    //Create systems
    const angleStep = 2 * Math.PI / count;
    let angle = 0;
    while(angle < 2 * Math.PI) {
      const system = new System();
      system.game = game._id;
      system.owner = game.owner;
      system.capacity = Math.floor(Math.random() * 100) + 100;
      system.type = 'regular';
      system.links = {};

      const distance = Math.random() * radius;
      system.x = center[0] + distance * Math.cos(angle);
      system.y = center[1] + distance * Math.sin(angle);

      angle += angleStep;

      await this.create(system).then(system => {
        systems.push(system);
      });
    }

    //Connect systems as a spanning tree
    for(let i = 0; i < systems.length; i++) {
      const visited: number[] = [];
      const start = Math.floor(Math.random() * systems.length);

      for(let add = 0; i < systems.length; i++) {
        const j = (start + add) % systems.length;

        if(i != j && !visited.includes(j)){
          visited.push(j);
          this.connectSystems(systems[i], systems[j]);

          if(this.checkForCycles(systems, systems[i])) {
            this.removeConnection(systems[i], systems[j]);
          }
          else{
            break;
          }
        }
      }
    }

    //Add random cycle
    const randomCycles = Math.floor(Math.random() * (count/10));
    for(let i = 0; i < randomCycles; i++) {
      const system1 = systems[Math.floor(Math.random() * systems.length)];
      const system2 = systems[Math.floor(Math.random() * systems.length)];

      this.connectSystems(system1, system2);
    }

    return systems;
  }

  /**
   * Checks if a system is part of a cycle in a cluster of systems
   * */
  private checkForCycles(systems: System[], start: System): boolean {
    const systemsCopy: System[] = [];
    systems.forEach(system => {
      const copy = new System();
      copy._id = system._id;
      copy.links = {...system.links};
      systemsCopy.push(copy);
    });

    const startCopy = new System();
    startCopy._id = start._id;
    startCopy.links = {...start.links};

    const stack:System[] = [];

    for(const link in startCopy.links) {
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
    const distance = Math.sqrt(Math.pow(system1.x - system2.x, 2) + Math.pow(system1.y - system2.y, 2));
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
