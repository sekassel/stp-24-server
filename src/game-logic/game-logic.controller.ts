import {BadRequestException, Controller, ForbiddenException, Get, Param, ParseArrayPipe, Query} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags} from '@nestjs/swagger';
import {AggregateId, AggregateResult, AGGREGATES} from './aggregates';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Types} from 'mongoose';
import {EmpireService} from '../empire/empire.service';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {ExplainedVariable, Variable} from './types';
import {explainVariable, getEmpireEffectSources} from './variables';
import {AggregateService} from './aggregate.service';
import {EmpireDocument} from '../empire/empire.schema';

@Controller('games/:game/empires/:empire')
@ApiTags('Game Logic')
@Validated()
@Auth()
@Throttled()
export class GameLogicController {
  constructor(
    private readonly empireService: EmpireService,
    private readonly aggregateService: AggregateService,
  ) {
  }

  @Get('variables')
  @ApiOperation({summary: 'Get the value and explanation of multiple empire variable.'})
  @ApiOkResponse({type: [ExplainedVariable]})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variables.'})
  @NotFound('Empire or one of the variables not found.')
  async getVariables(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Query('variables', ParseArrayPipe) variables: Variable[],
  ): Promise<ExplainedVariable[]> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    await this.checkUserAccess(currentUser, empire);
    const effectSources = getEmpireEffectSources(empire);
    return variables.map(v => explainVariable(v, effectSources));
  }

  @Get('variables/:variable')
  @ApiOperation({summary: 'Get the value and explanation of an empire variable.'})
  @ApiParam({name: 'variable', type: String})
  @ApiOkResponse({type: ExplainedVariable})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variable.'})
  @NotFound('Empire or variable not found.')
  async getVariable(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Param('variable') variable: Variable,
  ): Promise<ExplainedVariable> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    await this.checkUserAccess(currentUser, empire);
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
<details><summary>
\`${id}\`
---
</summary>
${aggregate.description}
### Parameters
${Object.entries(aggregate.params ?? {}).map(([param, desc]) => `- \`${param}\`: ${desc}`).join('\n') || '*None*'}
### Optional Parameters
${Object.entries(aggregate.optionalParams ?? {}).map(([param, desc]) => `- \`${param}\`: ${desc}`).join('\n') || '*None*'}

---
</details>
`).join('')}
`,
  })
  @ApiOkResponse({type: AggregateResult})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire aggregate.'})
  @NotFound('Empire or aggregate not found.')
  async getAggregate(
    @AuthUser() currentUser: User,
    @Param('empire', ObjectIdPipe) id: Types.ObjectId,
    @Param('aggregate') aggregate: string,
    @Query() query: Record<string, string>,
  ): Promise<AggregateResult> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    await this.checkUserAccess(currentUser, empire);
    const aggregateFn = AGGREGATES[aggregate as AggregateId] ?? notFound(aggregate);
    if (aggregateFn.params) {
      const missingParams = Object.keys(aggregateFn.params).filter(param => !query[param]);
      if (missingParams.length) {
        throw new BadRequestException(`Missing required parameters: ${missingParams.join(', ')}`);
      }
    }
    return aggregateFn.compute(this.aggregateService, empire, query);
  }

  private async checkUserAccess(currentUser: User, empire: EmpireDocument) {
    if (currentUser._id.equals(empire.user)) {
      return true;
    }
    if (await this.empireService.isSpectator(currentUser._id, empire.game)) {
      // user is a spectator
      return true;
    }
    throw new ForbiddenException('Cannot view another user\'s empire variable.');
  }
}

const paramDescriptions: Record<string, string> = {};
for (const [key, aggregate] of Object.entries(AGGREGATES)) {
  for (const [param, desc] of Object.entries(aggregate.params ?? {})) {
    paramDescriptions[param] ??= '';
    paramDescriptions[param] += `- For \`${key}\` (required): ${desc}\n`;
  }
  for (const [param, desc] of Object.entries(aggregate.optionalParams ?? {})) {
    paramDescriptions[param] ??= '';
    paramDescriptions[param] += `- For \`${key}\` (optional): ${desc}\n`;
  }
}

for (const [name, description] of Object.entries(paramDescriptions)) {
  ApiQuery({
    name,
    description,
    required: false,
  })(GameLogicController.prototype, 'getAggregate', Reflect.getOwnPropertyDescriptor(GameLogicController.prototype, 'getAggregate')!);
}
