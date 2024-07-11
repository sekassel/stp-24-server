import {HttpException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Job, JobDocument} from './job.schema';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {CreateJobDto} from './job.dto';
import {EmpireService} from '../empire/empire.service';
import {EmpireDocument} from '../empire/empire.schema';
import {JobType} from './job-type.enum';
import {SystemDocument} from '../system/system.schema';
import {JobLogicService} from './job-logic.service';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {GlobalSchema} from '../util/schema';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {ErrorResponse} from '../util/error-response';
import {FleetService} from "../fleet/fleet.service";
import {ShipService} from "../ship/ship.service";
import {SystemService} from "../system/system.service";
import {ResourceName} from "../game-logic/resources";
import {SystemLogicService} from "../system/system-logic.service";

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) model: Model<Job>,
    private empireService: EmpireService,
    private eventEmitter: EventService,
    private fleetService: FleetService,
    private shipService: ShipService,
    private empireLogicService: EmpireLogicService,
    private systemLogicService: SystemLogicService,
    private jobLogicService: JobLogicService,
    private systemService: SystemService,
  ) {
    super(model);
  }

  async createJob(dto: CreateJobDto, empire: EmpireDocument, system?: SystemDocument): Promise<Job | null> {
    // Check fleet access
    if (dto.type === JobType.UPGRADE) {
      if (!system) {
        return null;
      }
      const fleets = await this.fleetService.findAll({empire: empire._id, location: system._id});
      const ships = await this.shipService.findAll({fleet: {$in: fleets.map(f => f._id)}});
      this.jobLogicService.checkFleetAccess(dto, empire, fleets, ships, system);
    }

    let time: number | undefined;
    let cost: Partial<Record<ResourceName | 'time', number>> = {};

    if (dto.type === JobType.TRAVEL) {
      if (!dto.path || !dto.fleet) {
        return null;
      }
      const systemPaths: SystemDocument[] = [];
      for (const systemId of dto.path ?? []) {
        const systemDoc = await this.systemService.find(systemId);
        if (systemDoc) {
          systemPaths.push(systemDoc);
        }
      }
      const fleet = await this.fleetService.find(dto.fleet);
      if (!fleet) {
        return null;
      }
      const ships = await this.shipService.findAll({fleet: fleet._id});
      ({time, ...cost} = this.jobLogicService.getCostAndDuration(dto, empire, system, systemPaths, fleet, ships));
    } else {
      // Calculate resource requirements for the job
      ({time, ...cost} = this.jobLogicService.getCostAndDuration(dto, empire, system));
    }

    // Deduct resources from the empire
    this.empireLogicService.deductResources(empire, cost);

    const jobData: Omit<Job, keyof GlobalSchema> = {
      empire: empire._id,
      game: empire.game,
      priority: dto.priority,
      progress: 0,
      total: time!,
      cost,
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
      } else if (dto.type === JobType.SHIP) {
        jobData.fleet = dto.fleet;
        jobData.ship = dto.ship;
      } else if (dto.type === JobType.TRAVEL) {
        jobData.fleet = dto.fleet;
        jobData.path = dto.path;
      }
    }
    return this.create(jobData);
  }

  async updateJobs(empire: EmpireDocument, jobs: JobDocument[], systems: SystemDocument[]) {
    const systemJobs = new Set<string>;
    const techTagJobs = new Set<string>;
    const shipBuildJobs = new Set<string>;

    for (const job of jobs) {
      switch (job.type) {
        case JobType.TECHNOLOGY: {
          if (!job.technology) {
            continue;
          }
          const technology = TECHNOLOGIES[job.technology];
          if (!technology) {
            continue;
          }
          const primaryTag = technology.tags[0];
          if (techTagJobs.has(primaryTag)) {
            continue;
          }
          techTagJobs.add(primaryTag);
          this.progressJob(job, empire);
          break;
        }
        case JobType.BUILDING:
        case JobType.DISTRICT:
        case JobType.UPGRADE: {
          if (!job.system) {
            continue;
          }
          const system = systems.find(s => s._id.equals(job.system));
          if (!system) {
            continue;
          }
          if (systemJobs.has(job.system.toString())) {
            continue;
          }
          systemJobs.add(job.system.toString());
          this.progressJob(job, empire, system);
          break;
        }
        case JobType.SHIP: {
          if (!job.fleet || !job.ship || !job.system) {
            continue;
          }
          const system = systems.find(s => s._id.equals(job.system));
          if (!system) {
            continue;
          }
          if (shipBuildJobs.has(job.system.toString())) {
            continue;
          }
          shipBuildJobs.add(job.system.toString());
          this.progressJob(job, empire, system);
          break;
        }
        case JobType.TRAVEL: {
          if (!job.fleet || !job.path) {
            continue;
          }
          const fleet = await this.fleetService.find(job.fleet);
          const ships = await this.shipService.findAll({fleet: fleet?._id});
          const systems = await this.systemService.findAll({_id: {$in: job.path}});

          if (!fleet || !ships) {
            continue;
          }
          const slowestShipSpeed = this.systemLogicService.getSlowestShipSpeed(ships);

          let linkTimeSum = 0;
          for (let i = 1; i < job.path.length; i++) {
            const fromSystem = systems.find(system => system._id.equals(job.path![i - 1]));
            const toSystem = systems.find(system => system._id.equals(job.path![i]));

            if (!fromSystem || !toSystem) {
              continue;
            }
            linkTimeSum += Math.round(this.systemLogicService.getLinkTime(fromSystem, toSystem, slowestShipSpeed)!);

            if (job.progress + 1 >= linkTimeSum) {
              fleet.location = toSystem._id;
            }
          }
          fleet.markModified('location');
          await this.fleetService.saveAll([fleet]);
          this.progressJob(job, empire);
        }
      }
    }
  }

  private progressJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
    job.progress += 1;
    if (job.progress >= job.total) {
      this.completeJob(job, empire, system);
    } else {
      job.markModified('progress');
    }
  }

  private completeJob(job: JobDocument, empire: EmpireDocument, system ?: SystemDocument) {
    try {
      this.jobLogicService.completeJob(job, empire, system);
      job.result = {statusCode: 200, error: '', message: 'Job completed successfully'};
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        job.result = typeof response === 'object' ? response as ErrorResponse : {
          statusCode: error.getStatus(),
          error: error.message,
          message: response,
        };
      } else {
        throw error;
      }
    }
  }

  private async emit(event: string, job: Job) {
    const empire = await this.empireService.find(job.empire);
    if (!empire) {
      // no one to emit to
      return;
    }
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${job._id}.${event}`, job, [empire.user.toString()]);
  }
}
