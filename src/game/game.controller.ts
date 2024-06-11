import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation, ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateGameDto, UpdateGameDto} from './game.dto';
import {Game} from './game.schema';
import {GameService} from './game.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types, UpdateQuery} from 'mongoose';
import {GameLogicService} from '../game-logic/game-logic.service';

@Controller('games')
@ApiTags('Games')
@Validated()
@Auth()
@Throttled()
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameLogicService: GameLogicService,
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
  @ApiQuery({
    name: 'members',
    description: 'Count the members of the game.',
    required: false,
  })
  async findAll(
    @Query('members', new ParseBoolPipe({optional: true})) members?: boolean,
  ): Promise<Game[]> {
    return this.gameService.findAll(undefined, members ? {populate: 'members'} : {});
  }

  @Get(':id')
  @ApiOkResponse({type: Game})
  @NotFound()
  async findOne(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<Game | null> {
    return this.gameService.find(id, {populate: 'members'});
  }

  @Patch(':id')
  @NotFound()
  @ApiOperation({description: 'Change a game as owner.'})
  @ApiOkResponse({type: Game})
  @ApiConflictResponse({description: 'Game is already running.'})
  @ApiForbiddenResponse({description: 'Attempt to change a game that the current user does not own.'})
  @ApiQuery({
    name: 'tick',
    description: 'Advance the game by one period and run all empire and system calculations.',
    type: 'boolean',
    required: false,
  })
  async update(
    @AuthUser() user: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateGameDto,
    @Query('tick', new ParseBoolPipe({optional: true})) tick?: boolean,
  ): Promise<Game | null> {
    const existing = await this.gameService.find(id) ?? notFound(id);
    if (!user._id.equals(existing.owner)) {
      throw new ForbiddenException('Only the owner can change the game.');
    }
    if (existing.started && !(Object.keys(dto).length === 1 && dto.speed !== undefined)) {
      throw new ConflictException('Cannot change a running game.');
    }
    const update: UpdateQuery<Game> = dto;
    if (tick) {
      update.started = true;
      update.$inc = {period: 1};
      update.tickedAt = new Date();
    }
    const result = await this.gameService.update(id, dto, {populate: 'members'});
    if (result && !existing.started && result.started) {
      await this.gameLogicService.startGame(result);
    }
    if (tick && result) {
      await this.gameLogicService.updateGame(result);
      this.gameService.emit('ticked', result);
    }
    return result;
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
    return this.gameService.delete(id, {populate: 'members'});
  }
}
