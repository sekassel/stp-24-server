import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
  ApiOperation,
  ApiQuery,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {FleetService} from './fleet.service';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {notFound, NotFound, ObjectIdPipe, OptionalObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {CreateFleetDto, ReadFleetDto, UpdateFleetDto} from './fleet.dto';
import {Fleet} from './fleet.schema';
import {EmpireService} from '../empire/empire.service';
import {User} from '../user/user.schema';
import {SystemService} from '../system/system.service';
import {GameService} from '../game/game.service';

@Controller('games/:game/fleets')
@ApiTags('Fleets')
@Validated()
@Throttled()
export class FleetController {
  constructor(
    private readonly gameService: GameService,
    private readonly fleetService: FleetService,
    private readonly empireService: EmpireService,
    private readonly systemService: SystemService,
  ) {
  }

  @Post()
  @Auth()
  @ApiOperation({description: 'Create a new fleet.'})
  @ApiCreatedResponse({type: Fleet})
  @ApiForbiddenResponse({
    description: '- You can only build fleets in systems you own.\n' +
      '- (if ships=true) Only the game owner can create ships for crises.',
  })
  @ApiConflictResponse({description: 'The fleet must be built in a system with a shipyard building.'})
  @NotFound()
  @ApiQuery({
    name: 'ships',
    description: 'Immediately populate the fleet with ships (for crises, only available to game owner)',
    required: false,
    type: Boolean,
  })
  async createFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() createFleetDto: CreateFleetDto,
    @AuthUser() user: User,
    @Query('ships', new ParseBoolPipe({optional: true})) createShips?: boolean,
  ): Promise<Fleet | null> {
    const system = await this.systemService.find(createFleetDto.location) ?? notFound(`System ${createFleetDto.location}`);
    if (!system.owner) {
      throw new ForbiddenException('You can only build fleets in systems you own.');
    }
    const empire = await this.empireService.find(system.owner) ?? notFound(`Empire ${system.owner}`);
    if (!user._id.equals(empire.user)) {
      throw new ForbiddenException('You can only build fleets in systems you own.');
    }
    if (!system.buildings.includes('shipyard')) {
      throw new ConflictException('The fleet must be built in a system with a shipyard building.');
    }
    let ships = 0;
    if (createShips) {
      const gameDoc = await this.gameService.find(game) ?? notFound(`Game ${game}`);
      if (!gameDoc.owner.equals(user._id)) {
        throw new ForbiddenException('Only the game owner can create ships for crises.');
      }
      // The actual ships are created by ship.handler.ts,
      // which detects the fleet created event and sees that the number is greater than 0.
      ships = Object.values(createFleetDto.size).sum();
    }
    return this.fleetService.create({...createFleetDto, game, empire: empire._id, ships});
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get all fleets in the game, optionally filtered by the owner empire.'})
  @ApiOkResponse({type: [ReadFleetDto]})
  @ApiQuery({
    name: 'empire',
    description: 'Filter by the owning empire',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'ships',
    description: 'Count number of actual ships in the fleet',
    required: false,
    type: Boolean,
  })
  async getFleets(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Query('empire', OptionalObjectIdPipe) empire?: Types.ObjectId | undefined,
    @Query('ships', new ParseBoolPipe({optional: true})) ships?: boolean,
  ): Promise<ReadFleetDto[]> {
    const fleets = await this.fleetService.findAll(empire ? {game, empire} : {game}, {
      projection: {
        effects: 0,
        _private: 0
      },
      populate: ships ? 'ships' : undefined,
    });
    return fleets.map(fleet => this.toReadFleetDto(fleet.toObject()));
  }

  @Get(':id')
  @Auth()
  @ApiOkResponse({schema: {oneOf: refs(Fleet, ReadFleetDto)}})
  @NotFound('Fleet not found.')
  async getFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | Fleet> {
    const fleet = await this.fleetService.find(id, {populate: 'ships'}) ?? notFound(`Fleet ${id}`);
    const empire = fleet.empire && await this.empireService.find(fleet.empire);
    return empire?.user.equals(user._id) ? fleet : this.toReadFleetDto(fleet.toObject());
  }

  @Patch(':id')
  @Auth()
  @ApiOkResponse({type: Fleet})
  @NotFound('Fleet not found.')
  @ApiForbiddenResponse({description: 'You do not own this fleet.'})
  async updateFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateFleetDto: UpdateFleetDto,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | null> {
    await this.checkFleetAccess(game, id, user);
    return this.fleetService.update(id, updateFleetDto, {populate: 'ships'});
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: Fleet})
  @NotFound('Fleet not found.')
  @ApiForbiddenResponse({description: 'You do not own this fleet.'})
  async deleteFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | null> {
    await this.checkFleetAccess(game, id, user);
    return this.fleetService.delete(id, {populate: 'ships'});
  }

  async checkFleetAccess(game: Types.ObjectId, id: Types.ObjectId, user: User) {
    const fleet = await this.fleetService.find(id) ?? notFound(`Fleet ${id}`);
    if (!fleet.empire) {
      throw new ForbiddenException('This fleet has no owner.');
    }
    const empire = await this.empireService.find(fleet.empire) ?? notFound(`Empire ${fleet.empire}`);
    if (!empire.user.equals(user._id)) {
      throw new ForbiddenException('You do not own this fleet.');
    }
  }

  private toReadFleetDto(fleet: Fleet): ReadFleetDto {
    const {_private, effects, ...rest} = fleet;
    return rest as ReadFleetDto;
  }
}
