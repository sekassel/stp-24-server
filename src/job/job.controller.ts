import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {Job} from './job.schema';
import {User} from '../user/user.schema';
import {CreateJobDto} from './job.dto';
import {JobService} from './job.service';
import {EmpireService} from '../empire/empire.service';
import {JobType} from './job-type.enum';
import {EmpireDocument} from '../empire/empire.schema';
import {SystemService} from '../system/system.service';
import {UserService} from '../user/user.service';
import {JobLogicService} from './job-logic.service';

@Controller('games/:game/empires/:empire/jobs')
@ApiTags('Jobs')
@Validated()
@Throttled()
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobLogicService: JobLogicService,
    private readonly empireService: EmpireService,
    private readonly userService: UserService,
    private readonly systemService: SystemService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get the job list with optional filters for system and type.'})
  @ApiOkResponse({type: [Job]})
  @ApiForbiddenResponse({description: 'You can only access jobs for your own empire.'})
  @ApiQuery({
    name: 'system',
    description: 'Filter jobs by system',
    required: false,
    type: String,
    example: '60d6f7eb8b4b8a001d6f7eb1',
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter jobs by type (`building`, `district`, `upgrade`, `technology`).',
    required: false,
    enum: JobType,
  })
  async getJobs(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @AuthUser() user: User,
    @Query('system', ObjectIdPipe) system?: Types.ObjectId,
    @Query('type') type?: string,
  ): Promise<Job[]> {
    await this.checkUserAccess(game, user, empire);
    return this.jobService.findAll({game, empire, system, type});
  }

  @Get(':id')
  @Auth()
  @ApiOperation({description: 'Get a single job by ID.'})
  @ApiOkResponse({type: Job})
  @ApiForbiddenResponse({description: 'You can only access jobs for your own empire.'})
  @NotFound()
  async getJob(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Job | null> {
    await this.checkUserAccess(game, user, empire);
    return this.jobService.find(id);
  }

  @Post()
  @Auth()
  @ApiOperation({description: 'Create a new job for your empire.'})
  @ApiCreatedResponse({type: Job})
  @ApiForbiddenResponse({description: 'You can only create jobs for your own empire.'})
  @NotFound()
  async createJob(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @AuthUser() user: User,
    @Body() dto: CreateJobDto,
  ): Promise<Job | null> {
    const [userDoc, empireDoc, system] = await Promise.all([
      this.userService.find(user._id),
      this.checkUserAccess(game, user, empire),
      dto.system ? this.systemService.find(dto.system) : Promise.resolve(undefined),
    ]);
    const result = await this.jobService.createJob(dto, userDoc ?? notFound(user._id), empireDoc, system ?? undefined);
    await this.empireService.saveAll([empireDoc]);
    return result;
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({description: 'Delete a job from your empire.'})
  @ApiOkResponse({type: Job})
  @NotFound('Job not found.')
  @ApiForbiddenResponse({description: 'You can only delete jobs from your own empire.'})
  async deleteJob(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Job | null> {
    const userEmpire = await this.checkUserAccess(game, user, empire);
    const job = await this.jobService.findOne(id);
    if (!job || !job.cost) {
      throw new NotFoundException('Job not found.');
    }
    this.jobLogicService.refundResources(userEmpire, job);
    await this.empireService.saveAll([userEmpire]);
    return this.jobService.delete(id);
  }

  private async checkUserAccess(game: Types.ObjectId, user: User, empire: Types.ObjectId): Promise<EmpireDocument> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire) {
      throw new ForbiddenException('You do not own an empire in this game.');
    }

    const requestedEmpire = await this.empireService.findOne({_id: empire, game});
    if (!requestedEmpire || !requestedEmpire._id.equals(userEmpire._id)) {
      throw new ForbiddenException('You can only access jobs for your own empire.');
    }
    return userEmpire;
  }
}
