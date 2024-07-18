import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Fleet, FleetDocument} from './fleet.schema';
import {EmpireDocument} from '../empire/empire.schema';
import {Game} from '../game/game.schema';
import {System} from '../system/system.schema';
import {SHIP_NAMES, SHIP_TYPES} from '../game-logic/ships';

@Injectable()
@EventRepository()
export class FleetService extends MongooseRepository<Fleet> {
  constructor(
    @InjectModel(Fleet.name) model: Model<Fleet>,
    private eventEmitter: EventService,
  ) {
    super(model);
  }

  emit(event: string, fleet: Fleet) {
    this.eventEmitter.emit(`games.${fleet.game}.fleets.${fleet._id}.${event}`, fleet);
  }

  async generateFleets(empires: EmpireDocument[]): Promise<FleetDocument[]> {
    // each empire starts with an explorer fleet and a 3 fighter fleet
    return this.createMany(empires.flatMap(empire => [
      {
        empire: empire._id,
        game: empire.game,
        location: empire.homeSystem!,
        name: 'Explorer',
        size: {
          explorer: 1,
        },
      },
      {
        empire: empire._id,
        game: empire.game,
        location: empire.homeSystem!,
        name: '1st Fleet',
        size: {
          fighter: 3,
        },
      },
    ]));
  }

  async generateRogueFleets(game: Game, systems: System[]): Promise<FleetDocument[]> {
    const count = (game.settings?.size || 100) / 10;
    // spawn only aggressive ships
    const shipTypes = SHIP_NAMES.filter(type => 'default' in SHIP_TYPES[type].attack);
    return this.createMany(Array.from({length: count}, () => {
      const system = systems.random();
      const shipCount = 5 + Math.randInt(11);
      const size: Fleet['size'] = {};
      for (let i = 0; i < shipCount; i++) {
        // weighted selection of ship types by speed - smaller ships are more likely
        const shipType = shipTypes.randomWeighted(type => SHIP_TYPES[type].speed);
        size[shipType] = (size[shipType] || 0) + 1;
      }
      return ({
        game: game._id,
        location: system._id,
        name: 'Rogue Fleet',
        size,
      });
    }));
  }
}
