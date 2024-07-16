import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Fleet, FleetDocument} from './fleet.schema';
import {EmpireDocument} from '../empire/empire.schema';

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
}
