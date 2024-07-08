import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Ship} from "./ship.schema";

@Injectable()
@EventRepository()
export class ShipService extends MongooseRepository<Ship> {
  constructor(
    @InjectModel(Ship.name) model: Model<Ship>,
    private eventEmitter: EventService,
  ) {
    super(model);
  }

  emit(event: string, ship: Ship) {
    this.eventEmitter.emit(`games.${ship.game}.fleets.${ship.fleet}.ships.${ship._id}.${event}`, ship);
  }
}
