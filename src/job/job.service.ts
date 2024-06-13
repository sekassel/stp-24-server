import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job, JobDocument} from "./job.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {CreateJobDto} from "./job.dto";

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private eventEmitter: EventService,
  ) {
    super(jobModel);
  }

  async createJob(game: Types.ObjectId, empire: Types.ObjectId, createJobDto: CreateJobDto): Promise<JobDocument | null> {
    // TODOO: Calculate resource requirements for the job
    // TODOO: Deduct resources from the empire (fail if insufficient)
    // TODOO: Calculate total and cost (depending on action), progress = 0
    // TODOO: Create the job
    return null;
  }

  async refundResources(game: Types.ObjectId, empire: Types.ObjectId, id: Types.ObjectId): Promise<JobDocument | null> {
    // TODOO: Refund resources for the job to the empire
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      return null;
    }

    return job;
  }

  private emit(event: string, job: Job) {
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [
      job.game.toString(),
      job.empire.toString(),
    ]);
  }
}
