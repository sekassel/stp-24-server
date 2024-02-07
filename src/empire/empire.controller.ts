import {Body, Controller, ForbiddenException, Get, Param, Patch} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, refs} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {ReadEmpireDto, UpdateEmpireDto} from './empire.dto';
import {Empire} from './empire.schema';
import {EmpireService} from './empire.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {ExplainedVariable, Variable} from '../game-logic/types';
import {explainVariable, getEmpireEffectSources} from '../game-logic/variables';

@Controller('games/:game/empires')
@ApiTags('Game Empires')
@Validated()
@Auth()
@Throttled()
export class EmpireController {
  constructor(
    private readonly empireService: EmpireService,
  ) {
  }

  @Get()
  @ApiOkResponse({type: [Empire]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<ReadEmpireDto[]> {
    const empires = await this.empireService.findAll({game});
    return empires.map(e => this.empireService.mask(e));
  }

  @Get(':id')
  @ApiOkResponse({schema: {oneOf: refs(Empire, ReadEmpireDto)}})
  @NotFound()
  async findOne(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Empire | ReadEmpireDto | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    return currentUser._id.equals(empire.user) ? empire : this.empireService.mask(empire);
  }

  @Patch(':id')
  @ApiOperation({description: 'Update empire details.'})
  @ApiOkResponse({type: Empire})
  @ApiForbiddenResponse({description: 'Cannot modify another user\'s empire.'})
  @NotFound('Game or empire not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateEmpireDto,
  ): Promise<Empire | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot modify another user\'s empire.');
    }
    // TODO @simolse: implement resources trading and tech unlocks
    return this.empireService.update(id, dto);
  }

  @Get('variables/:variable')
  @ApiOperation({summary: 'Get the value and explanation of an empire variable.'})
  @ApiOkResponse({type: ExplainedVariable})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variable.'})
  @NotFound()
  async getVariable(
    @AuthUser() currentUser: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Param('variable') variable: Variable,
  ): Promise<ExplainedVariable> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const effectSources = getEmpireEffectSources(empire);
    return explainVariable(variable, effectSources);
  }
}