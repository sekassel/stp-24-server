import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job, JobDocument} from "./job.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {CreateJobDto} from "./job.dto";
import {EmpireService} from "../empire/empire.service";
import {Empire, EmpireDocument} from "../empire/empire.schema";
import {ResourceName} from "../game-logic/resources";
import {JobType} from "./job-type.enum";
import {SystemService} from "../system/system.service";
import {BuildingName} from "../game-logic/buildings";
import {DistrictName} from "../game-logic/districts";
import {TechnologyTag} from "../game-logic/types";
import {getNextSystemType, SystemType} from "../system/system-type.enum";

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private eventEmitter: EventService,
    private empireService: EmpireService,
    private systemService: SystemService,
  ) {
    super(jobModel);
  }

  async createJob(empire: EmpireDocument, createJobDto: CreateJobDto): Promise<JobDocument | null> {
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

  private async calculateCost(empire: EmpireDocument, createJobDto: CreateJobDto) {
    if (!createJobDto.system) {
      throw new BadRequestException('System ID is required for this job type.');
    }
    const system = await this.systemService.findOne(createJobDto.system);
    if (!system) {
      throw new BadRequestException('System not found.');
    }
    switch (createJobDto.type) {
      case JobType.BUILDING:
        const building = createJobDto.building as BuildingName;
        if (!createJobDto.building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        await this.systemService.updateBuildings(system, [building], empire);
        break;
      case JobType.DISTRICT:
        const district: Partial<Record<DistrictName, number>> = {[createJobDto.district as DistrictName]: 1};
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        await this.systemService.updateDistricts(system, district, empire);
        break;
      case JobType.UPGRADE:
        const type = getNextSystemType(system.type as SystemType);
        if (!type) {
          throw new BadRequestException('System type cannot be upgraded further.');
        }
        await this.systemService.upgradeSystem(system, type, empire);
        break;
      case JobType.TECHNOLOGY:
        const technology = createJobDto.technology as TechnologyTag;
        if (!technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        await this.empireService.unlockTechnology(empire, [technology]);
        break;
      default:
        throw new BadRequestException('Invalid job type.');
    }
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
