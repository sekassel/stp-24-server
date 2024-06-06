import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job} from "./job.schema";
import {Model} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";

@Injectable()
@EventRepository()
export class JobsService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private eventEmitter: EventService,
  ) {
    super(jobModel);
  }
}
