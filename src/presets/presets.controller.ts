import {Controller, Get} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {TRAITS} from "../game-logic/traits";
import {Trait} from "../game-logic/types";
import {Throttled} from "../util/throttled.decorator";
import {NotFound} from "@mean-stream/nestx";

@Controller('presets')
@ApiTags('Presets')
@Throttled()
export class PresetsController {
  @Get('traits')
  @ApiOkResponse({type: [Trait]})
  getTraits(): Trait[] {
    return Object.values(TRAITS);
  }

  @Get('traits/:id')
  @ApiOkResponse({type: Trait})
  @NotFound()
  getTrait(id: string): Trait | undefined {
    return TRAITS[id];
  }
}
