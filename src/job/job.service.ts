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

@Injectable()
@EventRepository()
export class JobService extends MongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name) model: Model<Job>,
    private empireService: EmpireService,
    private eventEmitter: EventService,
    private empireLogicService: EmpireLogicService,
    private jobLogicService: JobLogicService,
  ) {
    super(model);
  }

  async createJob(dto: CreateJobDto, empire: EmpireDocument, system?: SystemDocument): Promise<Job | null> {
    // Check fleet access
    await this.jobLogicService.checkFleetAccess(dto, empire, system);

    // Calculate resource requirements for the job
    const {time, ...cost} = this.jobLogicService.getCostAndDuration(dto, empire, system);

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
      }
    }
    return this.create(jobData);
  }

  updateJobs(empire: EmpireDocument, jobs: JobDocument[], systems: SystemDocument[]) {
    const systemJobs = new Set<string>;
    const techTagJobs = new Set<string>;

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

  private completeJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
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
