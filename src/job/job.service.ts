import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
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

  async createJob(dto: CreateJobDto, user: UserDocument, empire: EmpireDocument, system?: SystemDocument): Promise<Job | null> {
    // Calculate resource requirements for the job
    const cost = this.jobLogicService.getCost(dto, user, empire, system);

    // Deduct resources from the empire
    this.empireLogicService.deductResources(empire, cost);

    // TODO: Calculate total (depending on action), replace 5 with variable
    const total = 5;

    const jobData: Omit<Job, keyof GlobalSchema> = {
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
      // TODO v4: Maybe do a priority sorting?
      const sortedJobs = jobsInSystem.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      for (const job of sortedJobs) {
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
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        this.emitJobFailedEvent(job, error.message, empire);
      }
    }
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
