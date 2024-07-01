import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {War} from "./war.schema";

@Injectable()
@EventRepository()
export class WarService extends MongooseRepository<War> {
  constructor(
    @InjectModel(War.name) model: Model<War>,
    private eventEmitter: EventService,
  ) {
    super(model);
  }
}
