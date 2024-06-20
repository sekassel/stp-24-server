import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Job} from "./job.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository, notFound} from "@mean-stream/nestx";
import {CreateJobDto} from "./job.dto";
import {EmpireService} from "../empire/empire.service";
import {EmpireDocument} from "../empire/empire.schema";
import {ResourceName} from "../game-logic/resources";
import {SystemService} from "../system/system.service";
import {JobType} from "./job-type.enum";
import {BuildingName} from "../game-logic/buildings";
import {DistrictName} from "../game-logic/districts";
import {getNextSystemType} from "../system/system-type.enum";
import {SystemUpgradeName} from "../game-logic/system-upgrade";
import {UserService} from "../user/user.service";
import {TECHNOLOGIES} from "../game-logic/technologies";

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private eventEmitter: EventService,
    private empireService: EmpireService,
    private systemService: SystemService,
    private userService: UserService,
  ) {
    super(jobModel);
  }

  async createJob(empire: EmpireDocument, createJobDto: CreateJobDto): Promise<Job | null> {
    // Calculate resource requirements for the job
    const cost = await this.checkResources(empire, createJobDto);

    // Deduct resources from the empire
    const resourceUpdates: Partial<Record<ResourceName, number>> = {};
    for (const [resource, amount] of Object.entries(cost)) {
      const resourceName = resource as ResourceName;
      console.log(resourceName, amount);
      if (empire.resources[resourceName] < amount) {
        throw new BadRequestException(`Not enough resources: ${resource}`);
      }
      resourceUpdates[resourceName] = empire.resources[resourceName] - amount;
    }
    await this.empireService.updateOne({_id: empire._id}, {$set: {resources: resourceUpdates}});

    // TODO: Calculate total (depending on action), replace 5 with variable
    const total = 5;

    const jobData: Partial<Job> = {
      empire: empire._id,
      game: empire.game,
      progress: 0,
      total,
      cost: cost as Record<ResourceName, number>,
      type: createJobDto.type,
    };

    if (createJobDto.type === JobType.TECHNOLOGY) {
      jobData.technology = createJobDto.technology;
    } else {
      jobData.system = createJobDto.system;
      if (createJobDto.type === JobType.BUILDING) {
        jobData.building = createJobDto.building;
      } else {
        jobData.district = createJobDto.district;
      }
    }
    return await this.jobModel.create(jobData);
  }

  private async checkResources(empire: EmpireDocument, createJobDto: CreateJobDto): Promise<Partial<Record<ResourceName, number>>> {
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
        const buildingCosts = this.systemService.getBuildingCosts(system, [building], empire);
        return this.aggregateCosts(buildingCosts, building);
      case JobType.DISTRICT:
        const district = createJobDto.district as DistrictName;
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        return this.systemService.getDistrictCosts(district, empire);
      case JobType.UPGRADE:
        const type = getNextSystemType(system.type as SystemUpgradeName);
        if (!type) {
          throw new BadRequestException('System type cannot be upgraded further.');
        }
        //await this.systemService.upgradeSystem(system, type, empire);
        break;
      case JobType.TECHNOLOGY:
        if (!createJobDto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[createJobDto.technology];
        if (!technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const user = await this.userService.find(empire.user) ?? notFound(empire.user);
        return {research: this.empireService.getTechnologyCost(user, empire, technology)};
    }
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

  private aggregateCosts(costs: Record<string, [ResourceName, number][]>, building: BuildingName): Record<ResourceName, number> {
    const aggregated: Record<ResourceName, number> = {} as Record<ResourceName, number>;
    const filteredCosts = costs[building];
    for (const [resource, amount] of filteredCosts) {
      if (!aggregated[resource]) {
        aggregated[resource] = 0;
      }
      aggregated[resource] += amount;
    }
    return aggregated;
  }

  private emit(event: string, job: Job) {
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [
      job.game.toString(),
      job.empire.toString(),
    ]);
  }
}
