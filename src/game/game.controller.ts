import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateGameDto, UpdateGameDto} from './game.dto';
import {Game} from './game.schema';
import {GameService} from './game.service';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';

@Controller('games')
@ApiTags('Games')
@Validated()
@Auth()
@Throttled()
export class GameController {
  constructor(
    private readonly gameService: GameService,
  ) {
  }

  @Post()
  @ApiOperation({description: 'Create a game. The current user becomes the owner and is automatically added as a member.'})
  @ApiCreatedResponse({type: Game})
  async create(@AuthUser() user: User, @Body() dto: CreateGameDto): Promise<Game> {
    return this.gameService.create({...dto, owner: user._id});
  }

  @Get()
  @ApiOkResponse({type: [Game]})
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({type: Game})
  @NotFound()
  async findOne(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<Game | null> {
    return this.gameService.find(id);
  }

  @Patch(':id')
  @NotFound()
  @ApiOperation({description: 'Change a game as owner.'})
  @ApiOkResponse({type: Game})
  @ApiConflictResponse({description: 'Game is already running.'})
  @ApiForbiddenResponse({description: 'Attempt to change a game that the current user does not own.'})
  async update(@AuthUser() user: User, @Param('id', ObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateGameDto): Promise<Game | null> {
    const existing = await this.gameService.find(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (!user._id.equals(existing.owner)) {
      throw new ForbiddenException('Only the owner can change the game.');
    }
    if (existing.started) {
      throw new ConflictException('Cannot change a running game.');
    }
    return this.gameService.update(id, dto);
  }

  @Delete(':id')
  @NotFound()
  @ApiOperation({description: 'Delete a game as owner. All members will be automatically kicked.'})
  @ApiOkResponse({type: Game})
  @ApiForbiddenResponse({description: 'Attempt to delete a game that the current user does not own.'})
  async delete(@AuthUser() user: User, @Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<Game | null> {
    const existing = await this.gameService.findOne(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (!user._id.equals(existing.owner)) {
      throw new ForbiddenException('Only the owner can delete the game.');
    }
    return this.gameService.delete(id);
  }
}
