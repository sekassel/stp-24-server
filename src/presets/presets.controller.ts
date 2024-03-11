import {Controller, Get, Param} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath, refs} from '@nestjs/swagger';
import {TRAITS} from "../game-logic/traits";
import {Building, District, Resource, SystemUpgrade, Technology, Trait} from '../game-logic/types';
import {Throttled} from "../util/throttled.decorator";
import {NotFound} from "@mean-stream/nestx";
import {DistrictName, DISTRICTS} from "../game-logic/districts";
import {TECHNOLOGIES} from "../game-logic/technologies";
import {BuildingName, BUILDINGS} from "../game-logic/buildings";
import {RESOURCES} from '../game-logic/resources';
import {EMPIRE_VARIABLES} from '../game-logic/empire-variables';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';

@Controller('presets')
@ApiTags('Presets')
@ApiExtraModels(Resource, SystemUpgrade)
@Throttled()
export class PresetsController {
  @Get('resources')
  @ApiOkResponse({
    schema: {
      properties: Object.fromEntries(Object.keys(RESOURCES).map(k => [k, {$ref: getSchemaPath(Resource)}])),
    },
  })
  getResources(): typeof RESOURCES {
    return RESOURCES;
  }

  @Get('system-upgrades')
  @ApiOkResponse({
    schema: {
      properties: Object.fromEntries(Object.keys(SYSTEM_UPGRADES).map(k => [k, {$ref: getSchemaPath(SystemUpgrade)}])),
    },
  })
  getSystemUpgrades(): typeof SYSTEM_UPGRADES {
    return SYSTEM_UPGRADES;
  }

  @Get('empire-variables')
  @ApiOkResponse({type: Object})
  getEmpireVariables(): typeof EMPIRE_VARIABLES {
    return EMPIRE_VARIABLES;
  }

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
