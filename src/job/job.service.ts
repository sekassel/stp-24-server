import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Job, JobDocument} from './job.schema';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository, notFound} from '@mean-stream/nestx';
import {CreateJobDto} from './job.dto';
import {EmpireService} from '../empire/empire.service';
import {EmpireDocument} from '../empire/empire.schema';
import {RESOURCE_NAMES, ResourceName} from '../game-logic/resources';
import {SystemService} from '../system/system.service';
import {JobType} from './job-type.enum';
import {BuildingName} from '../game-logic/buildings';
import {DistrictName} from '../game-logic/districts';
import {SYSTEM_UPGRADES, SystemUpgradeName} from '../game-logic/system-upgrade';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {UpdateSystemDto} from '../system/system.dto';
import {UpdateEmpireDto} from '../empire/empire.dto';
import {SystemDocument} from '../system/system.schema';
import {TechnologyTag, Variable} from '../game-logic/types';
import {UserDocument} from '../user/user.schema';
import {calculateVariables, getVariables, VARIABLES} from '../game-logic/variables';

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private empireService: EmpireService,
    private systemService: SystemService,
    private eventEmitter: EventService,
  ) {
    super(jobModel);
  }

  async createJob(dto: CreateJobDto, user: UserDocument, empire: EmpireDocument, system?: SystemDocument): Promise<Job | null> {
    // Calculate resource requirements for the job
    const cost = this.getCost(dto, user, empire, system);

    // Deduct resources from the empire
    this.deductResources(empire, cost);

    // TODO: Calculate total (depending on action), replace 5 with variable
    const total = 5;

    const jobData: Partial<Job> = {
      empire: empire._id,
      game: empire.game,
      progress: 0,
      total,
      cost: cost as Record<ResourceName, number>,
      type: dto.type,
    };

    if (dto.type === JobType.TECHNOLOGY) {
      jobData.technology = dto.technology;
    } else {
      jobData.system = dto.system;
      if (dto.type === JobType.BUILDING) {
        jobData.building = dto.building;
      } else if (dto.type === JobType.DISTRICT) {
        jobData.district = dto.district;
      }
    }
    return this.jobModel.create(jobData);
  }

  private deductResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>): void {
    const missingResources = Object.entries(cost)
      .filter(([resource, amount]) => empire.resources[resource as ResourceName] < amount)
      .map(([resource, _]) => resource);
    if (missingResources.length) {
      throw new BadRequestException(`Not enough resources: ${missingResources.join(', ')}`);
    }
    for (const [resource, amount] of Object.entries(cost)) {
      empire.resources[resource as ResourceName] -= amount;
    }
    empire.markModified('resources');
  }

  private getCost(dto: CreateJobDto, user: UserDocument, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {

    switch (dto.type as JobType) {
      case JobType.BUILDING:
        if (!system) notFound(dto.system);
        const building = dto.building;
        if (!building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        return this.getCosts('buildings', building, empire, system);

      case JobType.DISTRICT:
        const district = dto.district;
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        return this.getCosts('districts', district, empire, system);

      case JobType.UPGRADE:
        if (!system) notFound(dto.system);
        if (system.owner !== empire._id && system.upgrade !== 'unexplored') {
          throw new BadRequestException('You can only upgrade systems you own.');
        }
        const type = SYSTEM_UPGRADES[system.upgrade]?.next;
        if (!type) {
          throw new BadRequestException('System type cannot be upgraded further.');
        }
        return this.getCosts('systems', type, empire, system);

      case JobType.TECHNOLOGY:
        if (!dto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[dto.technology] ?? notFound(dto.technology);
        return {research: this.empireService.getTechnologyCost(user, empire, technology)};
    }
  }

  private getCosts(prefix: keyof typeof VARIABLES, name: string, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {
    const result: Partial<Record<ResourceName, number>> = {};
    const variables = getVariables(prefix);
    calculateVariables(variables, empire, system);
    for (const resource of RESOURCE_NAMES) { // support custom variables
      const variable = `${prefix}.${name}.cost.${resource}`;
      if (variable in variables) {
        result[resource] = variables[variable as Variable];
      }
    }
    return result;
  }

  public async completeJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
    if (!job.empire) {
      return null;
    }

    let updateSystemDto: UpdateSystemDto = {};
    try {
      switch (job.type as JobType) {
        case JobType.TECHNOLOGY:
          if (!job.technology) {
            return null;
          }
          const updateEmpireDto: UpdateEmpireDto = {technologies: [job.technology as TechnologyTag]};
          return await this.empireService.updateEmpire(empire, updateEmpireDto, job);

        case JobType.BUILDING:
          const existingBuildings = system?.buildings || [];
          const buildings = [...existingBuildings, job.building as BuildingName];
          updateSystemDto = {buildings};
          break;

        case JobType.DISTRICT:
          const districtUpdate = {[job.district as DistrictName]: 1};
          updateSystemDto = {districts: districtUpdate};
          break;

        case JobType.UPGRADE:
          if (!system) {
            return null;
          }
          const upgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
          updateSystemDto = {upgrade};
          break;
      }
      if (system) {
        return await this.systemService.updateSystem(system, updateSystemDto, empire, job);
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        this.emitJobFailedEvent(job, error.message, empire);
      }
    }
    return null;
  }

  refundResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>) {
    for (const [resource, amount] of Object.entries(cost) as [ResourceName, number][] ) {
      if (empire.resources[resource] !== undefined) {
        empire.resources[resource] += amount;
      } else {
        empire.resources[resource] = amount;
      }
    }
    empire.markModified('resources');
  }

  private emitJobFailedEvent(job: JobDocument, errorMessage: string, empire: EmpireDocument) {
    const event = `games.${job.game}.empire.${job.empire}.jobs.${job._id}.failed`;
    const data = {message: errorMessage};
    this.eventEmitter.emit(event, data, [empire.user.toString()]);
  }

  private async emit(event: string, job: Job) {
    const empire = await this.empireService.find(job.empire);
    if (!empire) {
      // no one to emit to
      return;
    }
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [empire.user.toString()]);
  }
}
