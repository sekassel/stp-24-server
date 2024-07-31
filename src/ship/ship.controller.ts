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
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {ShipService} from './ship.service';
import {ReadShipDto, UpdateShipDto} from './ship.dto';
import {User} from '../user/user.schema';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {Ship, ShipDocument} from './ship.schema';
import {EmpireDocument} from '../empire/empire.schema';
import {FleetDocument} from '../fleet/fleet.schema';
import {EmpireService} from '../empire/empire.service';
import {FleetService} from '../fleet/fleet.service';
import {SHIP_NAMES, ShipTypeName} from '../game-logic/ships';

@Controller('games/:game/fleets/:fleet/ships')
@ApiTags('Ships')
@Validated()
@Throttled()
export class ShipController {
  constructor(
    private readonly shipService: ShipService,
    private readonly empireService: EmpireService,
    private readonly fleetService: FleetService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get all ships in the fleet.'})
  @ApiOkResponse({type: [ReadShipDto]})
  @ApiQuery({
    name: 'type',
    description: 'Filter ships by type.',
    required: false,
    enum: SHIP_NAMES,
  })
  async getFleetShips(
    @AuthUser() user: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleet: Types.ObjectId,
    @Query('type') type?: ShipTypeName,
  ): Promise<ReadShipDto[] | Ship[]> {
    const isOwner = await this.hasUserAccess(game, fleet, user);
    const ships = await this.shipService.findAll({game, fleet, type});
    return isOwner ? ships : ships.map(ship => this.toReadShipDto(ship.toObject()));
  }

  @Get(':id')
  @Auth()
  @ApiOkResponse({schema: {oneOf: refs(Ship, ReadShipDto)}})
  @NotFound('Ship not found.')
  async getFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleet: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadShipDto | Ship | null> {
    const isOwner = await this.hasUserAccess(game, fleet, user);
    const ship = await this.shipService.findOne({game, fleet, _id: id});
    return !ship || isOwner ? ship : this.toReadShipDto(ship.toObject());
  }

  @Patch(':id')
  @Auth()
  @ApiOkResponse({type: Ship})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  @ApiConflictResponse({description: 'Both fleets need to be in the same location to transfer ships.'})
  async updateFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleet: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateShipDto: UpdateShipDto,
    @AuthUser() user: User,
  ): Promise<Ship | null> {
    await this.checkUserAccess(game, fleet, user);

    // Change fleet if in same system
    if (updateShipDto.fleet && !updateShipDto.fleet.equals(fleet)) {
      const newFleet = await this.fleetService.find(updateShipDto.fleet, {game});
      const currentFleet = await this.fleetService.find(fleet, {game});

      if (!newFleet || !currentFleet) {
        throw new NotFoundException('Fleet not found.');
      }

      if (!newFleet.location?.equals(currentFleet.location)) {
        throw new ConflictException('Both fleets need to be in the same location to transfer ships.');
      }
    }
    return this.shipService.updateOne({game, fleet, _id: id}, updateShipDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: Ship})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  async deleteFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleet: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Ship | null> {
    await this.checkUserAccess(game, fleet, user);
    return this.shipService.deleteOne({game, fleet, _id: id});
  }

  private async hasUserAccess(game: Types.ObjectId, fleet: Types.ObjectId, user: User): Promise<boolean> {
    const fleetDoc = await this.fleetService.findOne({game, _id: fleet}, {projection: 'empire'}) ?? notFound(`Fleet ${fleet} not found`);
    if (!fleetDoc.empire) {
      return false;
    }
    const empire = await this.empireService.find(fleetDoc.empire, {projection: 'user'}) ?? notFound(`Empire ${fleetDoc.empire} not found`);
    return user._id.equals(empire.user);
  }

  private async checkUserAccess(game: Types.ObjectId, fleet: Types.ObjectId, user: User): Promise<void> {
    const isOwner = await this.hasUserAccess(game, fleet, user);
    if (!isOwner) {
      throw new ForbiddenException('You do not own this fleet.');
    }
  }

  private toReadShipDto(ship: Ship): ReadShipDto {
    const {_private, ...rest} = ship;
    return rest;
  }
}
