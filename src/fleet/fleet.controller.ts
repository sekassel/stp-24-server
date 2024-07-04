import {Controller} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {FleetService} from "./fleet.service";

@Controller('games/:game/fleets')
@ApiTags('Fleets')
@Validated()
@Throttled()
export class FleetController {
  constructor(
    private readonly fleetService: FleetService,
  ) {}
}
