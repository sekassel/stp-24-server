import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {notFound, NotFound, ObjectIdPipe, OptionalObjectIdPipe} from '@mean-stream/nestx';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {Job} from './job.schema';
import {User} from '../user/user.schema';
import {CreateJobDto, UpdateJobDto} from './job.dto';
import {JobService} from './job.service';
import {EmpireService} from '../empire/empire.service';
import {JobType} from './job-type.enum';
import {EmpireDocument} from '../empire/empire.schema';
import {SystemService} from '../system/system.service';
import {JobLogicService} from './job-logic.service';
import {MemberService} from '../member/member.service';
import {SystemDocument} from "../system/system.schema";
import {FleetService} from "../fleet/fleet.service";
import {Fleet, FleetDocument} from "../fleet/fleet.schema";
import {SHIP_TYPES} from "../game-logic/ships";
import {ShipService} from "../ship/ship.service";

@Controller('games/:game/empires/:empire/jobs')
@ApiTags('Jobs')
@Validated()
@Throttled()
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobLogicService: JobLogicService,
    private readonly empireService: EmpireService,
    private readonly memberService: MemberService,
    private readonly systemService: SystemService,
    private readonly fleetService: FleetService,
    private readonly shipService: ShipService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({
    description: 'Get the job list with optional filters for system and type. ' +
      'The order of the jobs is determined by the priority (lower values first) and creation time (if same priority).'
  })
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
    @Query('system', OptionalObjectIdPipe) system?: Types.ObjectId | undefined,
    @Query('type') type?: string,
  ): Promise<Job[]> {
    await this.checkUserRead(user, empire);
    return this.jobService.findAll({game, empire, system, type}, {sort: {priority: 1, createdAt: 1}});
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
    await this.checkUserRead(user, empire);
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
    const [empireDoc, system] = await Promise.all([
      this.checkUserWrite(user, empire),
      dto.system ? this.systemService.find(dto.system) : Promise.resolve(undefined),
    ]);
    if (dto.type === JobType.UPGRADE) {
      this.checkFleet(empireDoc, system);
    }
    const result = await this.jobService.createJob(dto, empireDoc, system ?? undefined);
    await this.empireService.saveAll([empireDoc]);
    return result;
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({description: 'Update a job from your empire.'})
  @ApiOkResponse({type: Job})
  @NotFound('Job not found.')
  @ApiForbiddenResponse({description: 'You can only update jobs from your own empire.'})
  async updateJob(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateJobDto,
    @AuthUser() user: User,
  ): Promise<Job | null> {
    await this.checkUserWrite(user, empire);
    return this.jobService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({description: 'Delete a job from your empire. Refunds the resources if the job is not completed.'})
  @ApiOkResponse({type: Job})
  @NotFound('Job not found.')
  @ApiForbiddenResponse({description: 'You can only delete jobs from your own empire.'})
  async deleteJob(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) empire: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Job | null> {
    const userEmpire = await this.checkUserWrite(user, empire);
    const job = await this.jobService.find(id) ?? notFound('Job not found.');
    if (job.cost && job.progress < job.total) {
      this.jobLogicService.refundResources(userEmpire, job);
      await this.empireService.saveAll([userEmpire]);
    }
    return this.jobService.delete(id);
  }

  private async checkUserWrite(user: User, empire: Types.ObjectId): Promise<EmpireDocument> {
    const requestedEmpire = await this.empireService.find(empire) ?? notFound(empire);
    if (requestedEmpire.user.equals(user._id)) {
      return requestedEmpire;
    }
    throw new ForbiddenException('You can only modify jobs for your own empire.');
  }

  private async checkUserRead(user: User, empire: Types.ObjectId): Promise<void> {
    const requestedEmpire = await this.empireService.findOne(empire) ?? notFound(empire);
    if (requestedEmpire.user.equals(user._id)) {
      return;
    }
    if (await this.memberService.isSpectator(requestedEmpire.game, user._id)) {
      return;
    }
    throw new ForbiddenException('You can only modify jobs for your own empire.');
  }

  private async checkFleet(empireId: Types.ObjectId, system: SystemDocument) {
    // Add more requirements for system upgrades here
    const fleets = await this.fleetService.findAll(empireId, system._id);
    if (system.upgrade === "unexplored") {
      if (!fleets) {
        throw new ForbiddenException('You must have a fleet with ship \'science\' in the system to upgrade it.');
      }
      await this.checkShip(fleets, SHIP_TYPES.science);
    } else if (system.upgrade === "explored") {
      if (!fleets) {
        throw new ForbiddenException('You must have a fleet with ship \'colony\' in the system to upgrade it.');
      }
      await this.checkShip(fleets, SHIP_TYPES.colony);
    }
  }

  private async checkShip(fleets: FleetDocument[], shipType: typeof SHIP_TYPES) {
    for (const fleet of fleets) {
      const ships = await this.shipService.findAll(fleet._id);
      if (fleet.ships[shipType.id] > 0) {
        return;
      }
    }
    throw new ForbiddenException(`You must have a fleet with ship '${shipType.id}' in the system to upgrade it.`);
  }
}
