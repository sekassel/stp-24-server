import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {GameService} from '../game/game.service';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateMemberDto, UpdateMemberDto} from './member.dto';
import {Member} from './member.schema';
import {MemberService} from './member.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {checkTraits} from '../game-logic/traits';
import {UniqueConflict} from '../util/unique-conflict.decorator';

@Controller('games/:game/members')
@ApiTags('Game Members')
@Validated()
@Auth()
@Throttled()
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly gameService: GameService,
  ) {
  }

  checkTraits(dto: CreateMemberDto | UpdateMemberDto) {
    if (!dto.empire) {
      return;
    }
    const result = checkTraits(dto.empire.traits);
    if (result.length) {
      throw new ConflictException(result, 'Invalid empire traits');
    }
  }

  @Post()
  @ApiOperation({description: 'Join a game with the current user.'})
  @ApiCreatedResponse({type: Member})
  @ApiNotFoundResponse({description: 'Game not found.'})
  @ApiForbiddenResponse({description: 'Incorrect password.'})
  @ApiConflictResponse({
    description: 'Game already started, too many members, user already joined, or invalid empire traits. ' +
      'Note: Joining without an empire (i.e. as spectator) is always allowed.'
  })
  @UniqueConflict<Member>({game_user: 'User is already a member of this game.'})
  async create(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() member: CreateMemberDto,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);

    const passwordMatch = await this.memberService.checkPassword(gameDoc, member);
    if (!passwordMatch) {
      throw new ForbiddenException('Incorrect password');
    }

    if (gameDoc.started && member.empire) {
      throw new ConflictException('Game already started');
    }

    if (gameDoc.maxMembers) {
      const nMembers = await this.memberService.count({game});
      if (nMembers >= gameDoc.maxMembers) {
        throw new ConflictException(`Maximum members (${gameDoc.maxMembers}) reached`);
      }
    }

    this.checkTraits(member);
    return this.memberService.create({
      ...member,
      game,
      user: currentUser._id,
    });
  }

  @Get()
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({game});
  }

  @Get(':user')
  @ApiOkResponse({type: Member})
  @NotFound()
  async findOne(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
  ): Promise<Member | null> {
    return this.memberService.findOne({game, user});
  }

  @Patch(':user')
  @ApiOperation({description: 'Change game membership for the current user.'})
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: 'Game already started or invalid empire traits.'})
  @ApiForbiddenResponse({description: 'Attempt to change membership of someone else.'})
  @NotFound('Game or membership not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);
    if (!currentUser._id.equals(user)) {
      throw new ForbiddenException('Cannot change membership of another user.');
    }
    if (gameDoc.started) {
      throw new ConflictException('Game already started');
    }
    this.checkTraits(dto);
    return this.memberService.updateOne({game, user}, dto);
  }

  @Delete(':user')
  @ApiOperation({description: 'Leave a game with the current user.'})
  @ApiOkResponse({type: Member})
  @ApiForbiddenResponse({description: 'Attempt to kick someone else.'})
  @ApiConflictResponse({description: 'Game is already running or owner attempted to leave the game.'})
  @NotFound('Game or membership not found.')
  async delete(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);
    if (currentUser._id.equals(gameDoc.owner)) {
      // owner can kick anyone but cannot leave
      if (currentUser._id.equals(user)) {
        throw new ConflictException('Cannot leave game as owner.');
      }
    } else if (!currentUser._id.equals(user)) {
      // other users can only leave themselves
      throw new ForbiddenException('Cannot kick another user.');
    }
    if (gameDoc.started) {
      throw new ConflictException('Cannot leave running game.');
    }
    return this.memberService.deleteOne({game, user});
  }
}
