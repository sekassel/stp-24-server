import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Fleet} from "./fleet.schema";

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
}
