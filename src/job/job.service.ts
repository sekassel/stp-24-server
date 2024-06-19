import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job} from "./job.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {CreateJobDto} from "./job.dto";
import {EmpireService} from "../empire/empire.service";
import {EmpireDocument} from "../empire/empire.schema";
import {ResourceName} from "../game-logic/resources";
import {SystemService} from "../system/system.service";

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

  async createJob(empire: EmpireDocument, createJobDto: CreateJobDto): Promise<Job | null> {
    // Calculate resource requirements for the job
    const cost: Record<ResourceName, number> = await this.checkResources(empire, createJobDto);

    // Deduct resources from the empire
    const resourceUpdates: Partial<Record<ResourceName, number>> = {};
    for (const [resource, amount] of Object.entries(cost)) {
      const resourceName = resource as ResourceName;
      if (empire.resources[resourceName] < amount) {
        throw new BadRequestException(`Not enough resources: ${resource}`);
      }
      resourceUpdates[resourceName] = empire.resources[resourceName] - amount;
    }
    await this.empireService.updateOne({_id: empire._id}, {$set: {resources: resourceUpdates}});

    // TODO: Calculate total (depending on action), replace 5 with variable
    const total = 5;

    return await this.jobModel.create({
      ...createJobDto,
      empire: empire._id,
      game: empire.game,
      progress: 0,
      total,
      cost,
    });
  }

  private async checkResources(empire: EmpireDocument, createJobDto: CreateJobDto): Promise<Record<ResourceName, number>> {
    if (!createJobDto.system) {
      throw new BadRequestException('System ID is required for this job type.');
    }

    const system = await this.systemService.findOne(createJobDto.system);
    if (!system) {
      throw new BadRequestException('System not found.');
    }

    /*switch (createJobDto.type) {
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
        const type = getNextSystemType(system.type as SystemUpgradeName);
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
    }*/
    return {
      alloys: 0,
      consumer_goods: 0,
      credits: 100,
      food: 0,
      fuel: 0,
      minerals: 50,
      population: 0,
      research: 0,
      energy: 25
    };
  }

  async refundResources(userEmpire: EmpireDocument, id: Types.ObjectId): Promise<EmpireDocument | null> {
    const job = await this.jobModel.findOne(id);
    if (!job) {
      return null;
    }

    for (const [resource, amount] of Object.entries(job.cost as Record<ResourceName, number>)) {
      if (userEmpire.resources[resource as ResourceName] !== undefined) {
        userEmpire.resources[resource as ResourceName] += amount;
      } else {
        userEmpire.resources[resource as ResourceName] = amount;
      }
    }
    await userEmpire.save();
    return userEmpire;
  }

  private emit(event: string, job: Job) {
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [
      job.game.toString(),
      job.empire.toString(),
    ]);
  }
}
