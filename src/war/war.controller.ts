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
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {WarService} from './war.service';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {War} from './war.schema';
import {User} from '../user/user.schema';
import {NotFound, ObjectIdPipe, OptionalObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {CreateWarDto, UpdateWarDto} from './war.dto';
import {EmpireService} from '../empire/empire.service';
import {EmpireDocument} from '../empire/empire.schema';

@Controller('games/:game/wars')
@ApiTags('Wars')
@Validated()
@Throttled()
export class WarController {
  constructor(
    private readonly warService: WarService,
    private readonly empireService: EmpireService,
  ) {
  }

  @Post()
  @Auth()
  @ApiOperation({description: 'Create a new war.'})
  @ApiCreatedResponse({type: War})
  @ApiForbiddenResponse({description: 'You are not the attacker in this war.'})
  @ApiConflictResponse({description: 'A war is already ongoing between these empires.'})
  @NotFound()
  async createWar(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() createWarDto: CreateWarDto,
    @AuthUser() user: User,
  ): Promise<War | null> {
    const userEmpire = await this.findUserEmpire(game, user);
    if (!userEmpire._id.equals(createWarDto.attacker)) {
      throw new ForbiddenException('You are not the attacker in this war.');
    }

    const existingWar = await this.warService.findOne({
      game,
      $or: [
        {attacker: createWarDto.attacker, defender: createWarDto.defender},
        {attacker: createWarDto.defender, defender: createWarDto.attacker},
      ],
    });
    if (existingWar) {
      throw new ConflictException('A war is already ongoing between these empires.');
    }

    return this.warService.create({...createWarDto, game});
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get all wars in the game, optionally filtered by attacker or defender.'})
  @ApiOkResponse({type: [War]})
  @ApiQuery({
    name: 'empire',
    description: 'Filter by attacker or defender',
    required: false,
    type: String,
  })
  async getWars(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Query('empire', OptionalObjectIdPipe) empire?: Types.ObjectId | undefined,
  ): Promise<War[]> {
    return this.warService.findAll(empire ? {game, $or: [{attacker: empire}, {defender: empire}]} : {game});
  }

  @Get(':id')
  @Auth()
  @ApiOperation({description: 'Get a single war by ID.'})
  @ApiOkResponse({type: War})
  @NotFound()
  async getWar(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<War | null> {
    return this.warService.find(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({description: 'Update a war.'})
  @ApiOkResponse({type: War})
  @NotFound('War not found.')
  @ApiForbiddenResponse({description: 'You are not the attacker in this war.'})
  async updateWar(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateWarDto: UpdateWarDto,
    @AuthUser() user: User,
  ): Promise<War | null> {
    await this.checkWarAccess(game, user, id);
    return this.warService.update(id, updateWarDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({description: 'Delete a war.'})
  @ApiOkResponse({type: War})
  @NotFound('War not found.')
  @ApiForbiddenResponse({description: 'You are not the attacker in this war.'})
  async deleteWar(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<War | null> {
    await this.checkWarAccess(game, user, id);
    return this.warService.delete(id);
  }

  private async findUserEmpire(game: Types.ObjectId, user: User): Promise<EmpireDocument> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire) {
      throw new ForbiddenException('You do not own an empire in this game.');
    }
    return userEmpire;
  }

  private async checkWarAccess(game: Types.ObjectId, user: User, warId: Types.ObjectId) {
    const userEmpire = await this.findUserEmpire(game, user);
    const war = await this.warService.findOne(warId);
    if (!war || !war.game.equals(game)) {
      throw new NotFoundException('War not found.');
    }
    if (!war.attacker.equals(userEmpire._id)) {
      throw new ForbiddenException('You are not the attacker in this war.');
    }
  }
}
