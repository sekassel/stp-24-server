import {Body, Controller, ForbiddenException, Get, Param, Patch, Query} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {UpdateSystemDto} from './system.dto';
import {System} from './system.schema';
import {SystemService} from './system.service';
import {notFound, NotFound, ObjectIdPipe, OptionalObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {EmpireService} from '../empire/empire.service';
import {MONGO_ID_FORMAT} from '../util/schema';

@Controller('games/:game/systems')
@ApiTags('Game Systems')
@Validated()
@Auth()
@Throttled()
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly empireService: EmpireService,
  ) {
  }

  @Get()
  @ApiOkResponse({type: [System]})
  @ApiQuery({
    name: 'owner',
    description: 'Filter systems by owner.',
    required: false,
    ...MONGO_ID_FORMAT,
  })
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Query('owner', OptionalObjectIdPipe) owner?: Types.ObjectId | undefined,
  ): Promise<System[]> {
    return this.systemService.findAll(owner ? {game, owner} : {game});
  }

  @Get(':id')
  @ApiOkResponse({type: System})
  @NotFound()
  async findOne(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<System | null> {
    return this.systemService.find(id);
  }

  @Patch(':id')
  @ApiOperation({description: 'Update system details.'})
  @ApiOkResponse({type: System})
  @ApiForbiddenResponse({description: 'You are not the owner of this system.'})
  @NotFound('Game or system not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateSystemDto,
  ): Promise<System | null> {
    const system = await this.systemService.find(id) ?? notFound(id);
    const userEmpire = await this.empireService.findOne({user: currentUser._id, game}) ?? notFound('User empire not found.');
    if (!system.owner || !system.owner.equals(userEmpire._id)) {
      throw new ForbiddenException('You are not the owner of this system.');
    }
    await this.systemService.updateSystem(system, dto, userEmpire);
    await this.systemService.saveAll([system]) // emits update events
    await this.empireService.saveAll([userEmpire]);
    return system;
  }
}
