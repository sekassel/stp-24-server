import {Controller, ForbiddenException, Get, NotFoundException, Param} from "@nestjs/common";
import {ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {ShipService} from "./ship.service";
import {ReadShipDto} from "./ship.dto";
import {User} from "../user/user.schema";
import {Auth, AuthUser} from "../auth/auth.decorator";
import {ObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";
import {Ship} from "./ship.schema";
import {EmpireDocument} from "../empire/empire.schema";
import {Fleet} from "../fleet/fleet.schema";
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
    //await this.shipService.create(testShip);
    const fleet = await this.getFleet(game, fleetId);
    const ships = await this.shipService.findAll({fleet: fleet._id});
    const empire = await this.empireService.findOne({game, user: user._id});
    return ships.map(ship => this.toReadShipDto(ship, fleet.empire !== undefined && fleet.empire == empire?._id));
  }

  private async getFleet(game: Types.ObjectId, fleetId: Types.ObjectId): Promise<Fleet> {
    const fleet = await this.fleetService.find(fleetId, {game});
    if (!fleet) {
      throw new NotFoundException('Fleet not found.');
    }
    return fleet;
  }

  private async checkUserAccess(game: Types.ObjectId, user: User): Promise<EmpireDocument> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire) {
      throw new ForbiddenException('You don\'t have an empire in this game.');
    }
    return userEmpire;
  }

  private toReadShipDto(ship: Ship, includePrivate: boolean): ReadShipDto {
    const {_id, game, empire, fleet, type,
      experience, _public, createdAt, updatedAt} = ship;
    const readShipDto: ReadShipDto = {_id, game, empire, fleet, type, experience, _public, createdAt, updatedAt};
    if (includePrivate) {
      (readShipDto as any)._private = ship._private;
      (readShipDto as any).health = ship.health;
    }
    return readShipDto;
  }
}
