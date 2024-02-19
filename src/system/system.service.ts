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
    clusters.push(this.createCluster(10, 100, [0, 0]));

    //TODO: Connect clusters

    //Add clusters
    clusters.forEach(cluster => {
      cluster.forEach(system => {
        system.game = game._id;
        system.owner = game.owner;
        system.capacity = Math.floor(Math.random() * 100) + 100;
        system.buildingSlots = this.createBuildingSlots(system.type);
        this.create(system);
        this.emit('created', system);
      });
    })
  }

  private createBuildingSlots(type: string): Record<string, number> {
    //TODO: Random building slots depending on type
    switch (type) {
      case 'planet':
        return {
          power_plant: Math.floor(Math.random() * 5) + 1,
          mine: Math.floor(Math.random() * 5) + 1,
          farm: Math.floor(Math.random() * 5) + 1,
          research_lab: Math.floor(Math.random() * 5) + 1,
        }
      default:
        return {};
    }
  }

  private createCluster(count: number, radius: number, center: number[]): System[] {
    const systems: System[] = [];

    //Create systems
    const angleStep = 2 * Math.PI / count;
    let angle = 0;
    while(angle < 2 * Math.PI) {
      const system = new System();
      system.type = 'planet';

      const distance = Math.random() * radius;
      system.x = center[0] + distance * Math.cos(angle);
      system.y = center[1] + distance * Math.sin(angle);

      angle += angleStep;
    }

    //Connect systems as a spanning tree
    for(let i = 0; i < systems.length; i++) {
      const visited: number[] = [];
      let j = Math.floor(Math.random() * systems.length);

      while(true){
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

        j = (j + 1) % systems.length;
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

  private checkForCycles(systems: System[], start: System): boolean {
    const visited: System[] = [];
    const stack = [start];

    while(stack.length > 0) {
      const current = stack.pop();
      if(!current) break;

      if(visited.includes(current)) return true;

      visited.push(current);
      for(const link in current.links) {
        stack.push(...systems.filter(system => system._id.toString() === link));
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
