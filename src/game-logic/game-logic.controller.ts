import {BadRequestException, Controller, ForbiddenException, Get, Param, ParseEnumPipe, Query} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags} from '@nestjs/swagger';
import {AggregateId, AggregateResult, AGGREGATES} from './aggregates';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Types} from 'mongoose';
import {EmpireService} from '../empire/empire.service';
import {GameLogicService} from './game-logic.service';
import {SystemService} from '../system/system.service';
import {MONGO_ID_FORMAT} from '../util/schema';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';

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

  @Get('aggregates/:aggregate')
  @ApiOperation({
    summary: 'Get the value and explanation of an empire aggregate.',
    description: 'Query parameters can be used to add context to the aggregate.\n\n' +
      'Example: `GET .../system.resources.population.periodic?system=5f4e3d2c1b0a090807060504`',
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
    const missingParams = aggregateFn.params.filter(param => !query[param]);
    if (missingParams.length) {
      throw new BadRequestException(`Missing required parameters: ${missingParams.join(', ')}`);
    }
    return aggregateFn.compute(this.gameLogicService, empire, systems, query);
  }
}
