import {Body, Controller, ForbiddenException, Get, Param, ParseBoolPipe, Patch, Post, Query} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateEmpireDto, ReadEmpireDto, UpdateEmpireDto} from './empire.dto';
import {Empire} from './empire.schema';
import {EmpireService} from './empire.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {MemberService} from '../member/member.service';
import {GameService} from '../game/game.service';

@Controller('games/:game/empires')
@ApiTags('Game Empires')
@Validated()
@Auth()
@Throttled()
export class EmpireController {
  constructor(
    private readonly gameService: GameService,
    private readonly memberService: MemberService,
    private readonly empireService: EmpireService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({type: Empire})
  @ApiNotFoundResponse({description: 'Game not found.'})
  @ApiForbiddenResponse({description: 'Only the game owner can create empires.'})
  async create(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() dto: CreateEmpireDto,
    @AuthUser() currentUser: User,
  ): Promise<Empire> {
    const gameDoc = await this.gameService.find(game) ?? notFound(`Game ${game}`);
    if (!gameDoc.owner.equals(currentUser._id)) {
      throw new ForbiddenException('Only the game owner can create empires.');
    }
    return this.empireService.create({
      ...dto,
      game,
      user: currentUser._id,
    });
  }

  @Get()
  @ApiOkResponse({type: [ReadEmpireDto]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<ReadEmpireDto[]> {
    const empires = await this.empireService.findAll({game});
    return empires.map(e => this.empireService.mask(e));
  }

  @Get(':empire')
  @ApiOkResponse({schema: {oneOf: refs(Empire, ReadEmpireDto)}})
  @NotFound()
  async findOne(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Empire | ReadEmpireDto | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (currentUser._id.equals(empire.user)) {
      return empire;
    }
    if (await this.empireService.isSpectator(currentUser._id, empire.game)) {
      return empire;
    }
    return this.empireService.mask(empire);
  }

  @Patch(':empire')
  @ApiOperation({description: 'Update empire details.'})
  @ApiQuery({
    name: 'free',
    description: 'Change the resources directly without spending or receiving credits. ' +
      'Useful for events, testing or debugging. ' +
      'Note that it is not possible to change the population directly.',
  })
  @ApiOkResponse({type: Empire})
  @ApiForbiddenResponse({description: 'Cannot modify another user\'s empire.'})
  @NotFound('Game or empire not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateEmpireDto,
    @Query('free', new ParseBoolPipe({optional: true})) free = false,
  ): Promise<Empire | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot modify another user\'s empire.');
    }
    this.empireService.updateEmpire(empire, dto, free);
    await this.empireService.saveAll([empire]); // emits update event
    return empire;
  }
}
