import {Controller} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";

@Controller('games/:game/wars')
@ApiTags('Wars')
@Validated()
@Throttled()
export class WarController {
  constructor() {
  }
}
