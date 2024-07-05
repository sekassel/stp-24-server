import {
  Body,
  ConflictException,
  Controller, Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch
} from "@nestjs/common";
import {ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {ShipService} from "./ship.service";
import {ReadShipDto, UpdateShipDto} from "./ship.dto";
import {User} from "../user/user.schema";
import {Auth, AuthUser} from "../auth/auth.decorator";
import {NotFound, ObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";
import {Ship, ShipDocument} from "./ship.schema";
import {EmpireDocument} from "../empire/empire.schema";
import {FleetDocument} from "../fleet/fleet.schema";
import {EmpireService} from "../empire/empire.service";
import {FleetService} from "../fleet/fleet.service";

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
    //await this.shipService.create(testShip);
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get all ships in the fleet.'})
  @ApiOkResponse({type: [ReadShipDto]})
  async getFleetShips(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadShipDto[]> {
    const fleet = await this.getFleet(game, fleetId);
    const ships = await this.shipService.findAll({fleet: fleet._id});
    const empire = await this.empireService.findOne({game, user: user._id});
    return ships.map(ship => this.toReadShipDto(ship, this.checkUserAccess(fleet, empire)));
  }

  @Get(':id')
  @Auth()
  @ApiOkResponse({type: ReadShipDto})
  @NotFound('Ship not found.')
  async getFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadShipDto> {
    const fleet = await this.getFleet(game, fleetId);
    const ship = await this.getShip(id, fleet);
    const empire = await this.empireService.findOne({game, user: user._id});
    return this.toReadShipDto(ship, this.checkUserAccess(fleet, empire));
  }

  @Patch(':id')
  @Auth()
  @ApiOkResponse({type: ReadShipDto})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  @ApiConflictResponse()
  async updateFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateShipDto: UpdateShipDto,
    @AuthUser() user: User,
  ): Promise<ReadShipDto> {
    const ship = await this.getShip(id, await this.getFleet(game, fleetId));
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

    const updatedShip = await this.shipService.update(id, updateShipDto);
    if (!updatedShip) {
      throw new NotFoundException('Ship not found.');
    }
    return this.toReadShipDto(updatedShip, true);
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: ReadShipDto})
  @NotFound('Ship not found.')
  @ApiForbiddenResponse({description: 'You do not own this ship.'})
  async deleteFleetShip(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('fleet', ObjectIdPipe) fleetId: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadShipDto> {
    await this.getUserEmpireAccess(game, user, await this.getShip(id, await this.getFleet(game, fleetId)));

    const deletedShip = await this.shipService.delete(id);
    if (!deletedShip) {
      throw new NotFoundException('Ship not found.');
    }
    return this.toReadShipDto(deletedShip, true);
  }

  private async getFleet(game: Types.ObjectId, fleetId: Types.ObjectId): Promise<FleetDocument> {
    const fleet = await this.fleetService.find(fleetId, {game});
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

  private async getShip(id: Types.ObjectId, fleet: FleetDocument): Promise<ShipDocument> {
    const ship = await this.shipService.find(id, {fleet: fleet._id});
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

  private toReadShipDto(ship: Ship, includePrivate: boolean): ReadShipDto {
    const {
      _id, game, empire, fleet, type,
      experience, _public, createdAt, updatedAt
    } = ship;
    const readShipDto: ReadShipDto = {_id, game, empire, fleet, type, experience, _public, createdAt, updatedAt};
    if (includePrivate) {
      (readShipDto as any)._private = ship._private;
      (readShipDto as any).health = ship.health;
    }
    return readShipDto;
  }
}
