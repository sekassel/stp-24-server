import {Body, Controller, ForbiddenException, Get, Param, Patch,} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags,} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {GameService} from '../game/game.service';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {UpdateSystemDto} from './system.dto';
import {System} from './system.schema';
import {SystemService} from './system.service';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';

@Controller('games/:game/systems')
@ApiTags('Game Systems')
@Validated()
@Auth()
@Throttled()
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly gameService: GameService,
  ) {
  }

  @Get()
  @ApiOkResponse({type: [System]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<System[]> {
    return this.systemService.findAll({game});
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
    const oldSystem = await this.systemService.find(id);
    const owner = oldSystem?.owner ?? dto.owner;

    if(!currentUser._id.equals(owner?._id)){
      throw new ForbiddenException('You are not the owner of this system.');
    }

    return this.systemService.update(id, dto);
  }
}
