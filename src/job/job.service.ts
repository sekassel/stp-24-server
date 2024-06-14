import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job, JobDocument} from "./job.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {CreateJobDto} from "./job.dto";
import {EmpireService} from "../empire/empire.service";
import {Empire} from "../empire/empire.schema";
import {ResourceName} from "../game-logic/resources";
import {calculateVariables, getInitialVariables, getVariables} from "../game-logic/variables";

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private eventEmitter: EventService,
    private empireService: EmpireService,
  ) {
    super(jobModel);
  }

  async createJob(empire: Empire, createJobDto: CreateJobDto): Promise<JobDocument | null> {
    // Calculate resource requirements for the job
    const cost = this.calculateCost(empire, createJobDto);

    // TOD0: Deduct resources from the empire (fail if insufficient)
    if (!cost) {
      return null;
    }
    const hasSufficientResources = await this.checkResources(empire, cost);
    if (!hasSufficientResources) {
      return null;
    }
    const deductResources = this.deductResources(empire, cost);

    // TOD0: Calculate total and cost (depending on action), progress = 0
    // TOD0: Replace 5 with variable
    const total = 5;

    // TOD0: Create the job
    return await this.jobModel.create({...createJobDto, empire: empire._id, progress: 0, total, cost,});
  }

  async refundResources(empire: Empire, jobId: Types.ObjectId): Promise<JobDocument | null> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      return null;
    }
    // TOD0: Refund resources for the job to the empire
    for (const [resource, amount] of Object.entries(job.cost)) {
      if (empire.resources[resource as ResourceName] !== undefined) {
        empire.resources[resource as ResourceName] += amount;
      }
    }
    await empire.save();
    return job;
  }

  private emit(event: string, job: Job) {
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [
      job.game.toString(),
      job.empire.toString(),
    ]);
  }

  private calculateCost(empire: Empire, createJobDto: CreateJobDto): Record<ResourceName, number> {
    const variables = {
      ...getInitialVariables(),
      ...getVariables('buildings'),
      ...getVariables('districts'),
      ...getVariables('technologies'),
      ...getVariables('systems'),
    }
    calculateVariables(variables, empire);
    // TOD0: Calculate cost based on the job type and variables
    return {} as Record<ResourceName, number>;
  }

  private async checkResources(empire: Empire, cost: Record<ResourceName, number>): Promise<boolean> {
    // Check if the empire has sufficient resources for the job
    for (const [resource, amount] of Object.entries(cost)) {
      if ((empire.resources[resource as ResourceName] || 0) < amount) {
        return false;
      }
    }
    return true;
  }

  private async deductResources(empire: Empire, cost: Record<ResourceName, number>) {
    for (const [resource, amount] of Object.entries(cost)) {
      empire.resources[resource as ResourceName] -= amount;
    }
    // Doesn't work
    await this.empireService.saveAll([empire]);
  }
}
