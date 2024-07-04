import {Controller} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {ShipService} from "./ship.service";

@Controller('games/:game/fleets/:fleet/ships')
@ApiTags('Ships')
@Validated()
@Throttled()
export class ShipController {
  constructor(
    private readonly shipService: ShipService,
  ) {
  }

}
