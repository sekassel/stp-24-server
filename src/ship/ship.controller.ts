import {Controller, Get, Param} from "@nestjs/common";
import {ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {ShipService} from "./ship.service";
import {ReadShipDto} from "./ship.dto";
import {User} from "../user/user.schema";
import {Auth, AuthUser} from "../auth/auth.decorator";
import {ObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";

@Controller('games/:game/fleets/:fleet/ships')
@ApiTags('Ships')
@Validated()
@Throttled()
export class ShipController {
  constructor(
    private readonly shipService: ShipService,
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
  ): Promise<ReadShipDto[] | null> {
    return null;
  }
}
