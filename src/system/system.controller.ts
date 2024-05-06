import {Body, Controller, ForbiddenException, Get, Param, Patch, Query} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
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
  @NotFound('Game or system not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateSystemDto,
  ): Promise<System | null> {
    const oldSystem = await this.systemService.find(id) ?? notFound(id);
    const userEmpire = await this.empireService.findOne({user: currentUser._id, game});
    const owner = oldSystem.owner ?? dto.owner;

    if (!userEmpire?._id.equals(owner)) {
      throw new ForbiddenException('You are not the owner of this system.');
    }

    return this.systemService.updateSystem(oldSystem, dto, userEmpire);
  }
}
