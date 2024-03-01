import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
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
    return Object.entries(BUILDINGS).map(([key, value]) => ({
      name: key,
      ...value,
    })) as Building[];
  }

  @Get('buildings/:name')
  @ApiOkResponse({type: Building})
  getBuilding(@Param('name') name: string): Building {
    const building = BUILDINGS[name as BuildingName];
    if (!building) {
      throw new NotFoundException(`Building with name "${name}" not found.`);
    }
    return {name, ...building} as unknown as Building;
  }

  @Get('districts')
  @ApiOkResponse({type: [District]})
  getDistricts(): District[] {
    return Object.entries(DISTRICTS).map(([name, details]) => ({
      name,
      ...details,
    })) as District[];
  }

  @Get('districts/:name')
  @ApiOkResponse({type: District})
  getDistrict(@Param('name') name: string): District {
    const district = DISTRICTS[name as DistrictName];
    if (!district) {
      throw new NotFoundException(`District with name "${name}" not found.`);
    }
    return {name, ...district} as unknown as District;
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
