import {
  Body,
  Controller,
  Delete, ForbiddenException,
  Get,
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
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {Job} from './job.schema';
import {User} from '../user/user.schema';
import {CreateJobDto} from './job.dto';
import {JobService} from './job.service';
import {EmpireService} from "../empire/empire.service";

@Controller('games/:game/empires/:empire/jobs')
@ApiTags('Jobs')
@Validated()
@Throttled()
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly empireService: EmpireService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get the job list with optional filters for system and type.'})
  @ApiOkResponse({type: [Job]})
  @ApiForbiddenResponse({description: 'You can only access jobs for your own empire.'})
  @NotFound()
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
    enum: ['building', 'district', 'upgrade', 'technology'],
  })
  async getJobs(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @AuthUser() user: User,
    @Query('system') system?: Types.ObjectId,
    @Query('type') type?: string,
  ): Promise<Job[]> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire || !empire.equals(userEmpire._id)) {
      throw new ForbiddenException('You can only access jobs for your own empire.');
    }
    // TODO: Return jobs with given filters
    return Array.of(new Job());
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
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    if (!empire.equals(user._id)) {
      throw new ForbiddenException('You can only create jobs for your own empire.');
    }
    // TODO: Create job
    return new Job();
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
    if (!empire.equals(user._id)) {
      throw new ForbiddenException('You can only delete jobs from your own empire.');
    }
    // TODO: Delete job
    return null;
  }
}
