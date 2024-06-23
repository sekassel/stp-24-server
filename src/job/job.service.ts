import {BadRequestException, ConflictException, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Job, JobDocument} from './job.schema';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {CreateJobDto} from './job.dto';
import {EmpireService} from '../empire/empire.service';
import {EmpireDocument} from '../empire/empire.schema';
import {ResourceName} from '../game-logic/resources';
import {JobType} from './job-type.enum';
import {SystemDocument} from '../system/system.schema';
import {UserDocument} from '../user/user.schema';
import {JobLogicService} from './job-logic.service';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {GlobalSchema} from '../util/schema';
import {TECHNOLOGIES} from '../game-logic/technologies';

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
    const systemJobsMap: Record<string, JobDocument[]> = {};
    const progressingTechnologyTags: Record<string, boolean> = {};

    for (const job of jobs) {
      if (job.progress === job.total) {
        job.$isDeleted(true);
        continue;
      }

      if (job.type === JobType.TECHNOLOGY) {
        if (!job.technology) {
          continue;
        }
        const technology = TECHNOLOGIES[job.technology];
        if (technology) {
          const primaryTag = technology.tags[0];
          if (!progressingTechnologyTags[primaryTag]) {
            progressingTechnologyTags[primaryTag] = true;
            this.progressJob(job, empire);
          }
        }
      } else {
        if (!job.system) {
          continue;
        }
        (systemJobsMap[job.system.toString()] ??= []).push(job);
      }
    }

    for (const [systemId, jobsInSystem] of Object.entries(systemJobsMap)) {
      const system = systems.find(s => s._id.equals(systemId));

      for (const job of jobsInSystem) {
        if (job.type === JobType.BUILDING || job.type === JobType.DISTRICT || job.type === JobType.UPGRADE) {
          this.progressJob(job, empire, system);
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
        job.result = {
          statusCode: error.getStatus(),
          error: HttpStatus[error.getStatus()],
          message: error.message,
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
    this.eventEmitter.emit(`games.${job.game}.empires.${job.empire}.jobs.${event}`, job, [empire.user.toString()]);
  }
}
