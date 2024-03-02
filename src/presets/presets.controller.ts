import {Controller, Get, Param} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {TRAITS} from "../game-logic/traits";
import {Building, District, Technology, Trait} from "../game-logic/types";
import {Throttled} from "../util/throttled.decorator";
import {NotFound} from "@mean-stream/nestx";
import {DistrictName, DISTRICTS} from "../game-logic/districts";
import {TECHNOLOGIES} from "../game-logic/technologies";
import {BuildingName, BUILDINGS} from "../game-logic/buildings";

@Controller('presets')
@ApiTags('Presets')
@Throttled()
export class PresetsController {
  @Get('technologies')
  @ApiOkResponse({type: [Technology]})
  getTechnologies(): Technology[] {
    return Object.values(TECHNOLOGIES);
  }

  @Get('technologies/:id')
  @ApiOkResponse({type: Technology})
  @NotFound()
  getTechnology(@Param('id') id: string): Technology | undefined {
    return TECHNOLOGIES[id];
  }

  @Get('buildings')
  @ApiOkResponse({type: [Building]})
  getBuildings(): Building[] {
    return Object.values(BUILDINGS);
  }

  @Get('buildings/:id')
  @ApiOkResponse({type: Building})
  @NotFound()
  getBuilding(@Param('id') id: string): Building | undefined {
    return BUILDINGS[id as BuildingName];
  }

  @Get('districts')
  @ApiOkResponse({type: [District]})
  getDistricts(): District[] {
    return Object.values(DISTRICTS);
  }

  @Get('districts/:id')
  @ApiOkResponse({type: District})
  @NotFound()
  getDistrict(@Param('id') id: string): District | undefined {
    return DISTRICTS[id as DistrictName];
  }

  @Get('traits')
  @ApiOkResponse({type: [Trait]})
  getTraits(): Trait[] {
    return Object.values(TRAITS);
  }

  @Get('traits/:id')
  @ApiOkResponse({type: Trait})
  @NotFound()
  getTrait(@Param('id') id: string): Trait | undefined {
    return TRAITS[id];
  }
}
