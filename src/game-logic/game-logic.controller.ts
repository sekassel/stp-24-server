import {BadRequestException, Controller, ForbiddenException, Get, Param, ParseArrayPipe, Query} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import {AggregateId, AggregateResult, AGGREGATES} from './aggregates';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Types} from 'mongoose';
import {EmpireService} from '../empire/empire.service';
import {GameLogicService} from './game-logic.service';
import {SystemService} from '../system/system.service';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {ExplainedVariable, Variable} from './types';
import {explainVariable, getEmpireEffectSources} from './variables';

@Controller('games/:game/empires/:empire')
@ApiTags('Game Logic')
@Validated()
@Auth()
@Throttled()
export class GameLogicController {
  constructor(
    private readonly empireService: EmpireService,
    private readonly systemService: SystemService,
    private readonly gameLogicService: GameLogicService,
  ) {
  }

  @Get('variables')
  @ApiOperation({summary: 'Get the value and explanation of multiple empire variable.'})
  @ApiOkResponse({type: [ExplainedVariable]})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variables.'})
  @NotFound()
  async getVariables(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Query('variables', ParseArrayPipe) variables: Variable[],
  ): Promise<ExplainedVariable[]> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const effectSources = getEmpireEffectSources(empire);
    return variables.map(v => explainVariable(v, effectSources));
  }

  @Get('variables/:variable')
  @ApiOperation({summary: 'Get the value and explanation of an empire variable.'})
  @ApiParam({name: 'variable', type: String})
  @ApiOkResponse({type: ExplainedVariable})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variable.'})
  @NotFound()
  async getVariable(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Param('variable') variable: Variable,
  ): Promise<ExplainedVariable> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const effectSources = getEmpireEffectSources(empire);
    return explainVariable(variable, effectSources);
  }

  @Get('aggregates/:aggregate')
  @ApiOperation({
    summary: 'Get the total value and breakdown of an empire aggregate.',
    description: `Query parameters can be used to add context to the aggregate.

Example: \`GET .../resources.periodic?resource=energy&system=5f4e3d2c1b0a090807060504\`

These aggregates are available:
${Object.entries(AGGREGATES).map(([id, aggregate]) => `\
## \`${id}\`
${aggregate.description}
### Parameters
${Object.entries(aggregate.params ?? {}).map(([param, desc]) => `- \`${param}\`: ${desc}`).join('\n') || '*None*'}
### Optional Parameters
${Object.entries(aggregate.optionalParams ?? {}).map(([param, desc]) => `- \`${param}\`: ${desc}`).join('\n') || '*None*'}
`).join('')}
`,
  })
  @ApiOkResponse({type: AggregateResult})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire aggregate.'})
  @NotFound()
  async getAggregate(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Param('aggregate') aggregate: string,
    @Query() query: Record<string, string>,
  ): Promise<AggregateResult> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const systems = await this.systemService.findAll({owner: id});
    const aggregateFn = AGGREGATES[aggregate as AggregateId] ?? notFound(aggregate);
    if (aggregateFn.params) {
      const missingParams = Object.keys(aggregateFn.params).filter(param => !query[param]);
      if (missingParams.length) {
        throw new BadRequestException(`Missing required parameters: ${missingParams.join(', ')}`);
      }
    }
    return aggregateFn.compute(this.gameLogicService, empire, systems, query);
  }
}
