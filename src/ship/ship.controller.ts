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
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
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
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Query('type') type?: ShipTypeName,
  ): Promise<ReadShipDto[] | Ship[]> {
    const fleet = await this.getFleet(fleetId);
    const ships = await this.shipService.findAll({fleet: fleet._id, type});
    const empire = await this.empireService.findOne({game, user: user._id});
    return this.checkUserAccess(fleet, empire) ? ships : ships.map(ship => this.toReadShipDto(ship.toObject()));
  }

  @Get(':id')
  @Auth()
  @ApiOkResponse({schema: {oneOf: refs(Ship, ReadShipDto)}})
  @NotFound('Ship not found.')
  async getFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadShipDto | Ship> {
    const fleet = await this.getFleet(fleetId);
    const ship = await this.getShip(id, fleet._id);
    const empire = await this.empireService.findOne({game, user: user._id});
    return this.checkUserAccess(fleet, empire) ? ship : this.toReadShipDto(ship.toObject());
  }

  @Patch(':id')
  @Auth()
  @ApiOkResponse({type: Ship})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  @ApiConflictResponse({description: 'Both fleets need to be in the same location to transfer ships.'})
  async updateFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateShipDto: UpdateShipDto,
    @AuthUser() user: User,
  ): Promise<Ship | null> {
    const fleet = await this.getFleet(fleetId);
    const ship = await this.getShip(id, fleet._id);
    await this.getUserEmpireAccess(game, user, ship);

    // Change fleet if in same system
    if (updateShipDto.fleet && !updateShipDto.fleet.equals(ship.fleet)) {
      const newFleet = await this.fleetService.find(updateShipDto.fleet, {game});
      const currentFleet = await this.fleetService.find(ship.fleet, {game});

      if (!newFleet || !currentFleet) {
        throw new NotFoundException('Fleet not found.');
      }

      if (!newFleet.location?.equals(currentFleet.location)) {
        throw new ConflictException('Both fleets need to be in the same location to transfer ships.');
      }
    }
    return this.shipService.update(id, updateShipDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: Ship})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  async deleteFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Ship | null> {
    const fleet = await this.getFleet(fleetId);
    await this.getUserEmpireAccess(game, user, await this.getShip(id, fleet._id));
    return this.shipService.delete(id);
  }

  private async getFleet(fleetId: Types.ObjectId): Promise<FleetDocument> {
    const fleet = await this.fleetService.find(fleetId);
    if (!fleet) {
      throw new NotFoundException('Fleet not found.');
    }
    return fleet;
  }

  private async getUserEmpireAccess(game: Types.ObjectId, user: User, ship: ShipDocument): Promise<EmpireDocument> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire || !ship.empire?.equals(userEmpire._id)) {
      throw new ForbiddenException('You do not own this ship.');
    }
    return userEmpire;
  }

  private async getShip(id: Types.ObjectId, fleetId: Types.ObjectId): Promise<ShipDocument> {
    const ship = await this.shipService.find(id, {fleet: fleetId});
    if (!ship) {
      throw new NotFoundException('Ship not found.');
    }
    return ship;
  }

  private checkUserAccess(fleet: FleetDocument, empire: EmpireDocument | null): boolean {
    if (!empire || !fleet.empire) {
      return false;
    }
    return fleet.empire.equals(empire._id);
  }

  private toReadShipDto(ship: Ship): ReadShipDto {
    const {_private, ...rest} = ship;
    return rest;
  }
}
