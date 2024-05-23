import {Controller, Get, Header, Param, Res} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath} from '@nestjs/swagger';
import {TRAITS} from '../game-logic/traits';
import {Building, District, Resource, SystemType, SystemUpgrade, Technology, Trait} from '../game-logic/types';
import {Throttled} from '../util/throttled.decorator';
import {NotFound} from '@mean-stream/nestx';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {BuildingName, BUILDINGS} from '../game-logic/buildings';
import {RESOURCES} from '../game-logic/resources';
import {EMPIRE_VARIABLES} from '../game-logic/empire-variables';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {getInitialVariables} from '../game-logic/variables';
import {Digraph, toDot} from 'ts-graphviz';
import {toStream} from '@ts-graphviz/adapter';
import {Response} from 'express';
import {SYSTEM_TYPES} from '../game-logic/system-types';

@Controller('presets')
@ApiTags('Presets')
@ApiExtraModels(Resource, SystemUpgrade, SystemType)
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

  @Get('system-types')
  @ApiOkResponse({
    schema: {
      properties: Object.fromEntries(Object.keys(SYSTEM_TYPES).map(k => [k, {$ref: getSchemaPath(SystemType)}])),
    },
  })
  getSystemTypes(): typeof SYSTEM_TYPES {
    return SYSTEM_TYPES;
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

  @Get('technologies/tree')
  @Header('Content-Type', 'image/svg+xml')
  @ApiOperation({summary: 'Get the tech tree as an SVG'})
  @ApiOkResponse({content: {'image/svg+xml': {schema: {type: 'string', format: 'svg'}}}})
  async getTechTree(
    @Res() response: Response,
  ) {
    const g = new Digraph({
      rankdir: 'LR',
    });

    for (const tech of Object.values(TECHNOLOGIES)) {
      const node = g.node(tech.id, {
        label: `${tech.id}|Cost: ${tech.cost}|Tags: ${tech.tags.join(', ')}`,
        shape: 'record',
        style: 'filled',
      });
      switch (tech.tags[0]) {
        case 'engineering':
          node.attributes.set('fillcolor', 'orange');
          break;
        case 'physics':
          node.attributes.set('fillcolor', 'dodgerblue');
          break;
        case 'society':
          node.attributes.set('fillcolor', 'green3');
          break;
      }
      for (const req of tech.requires ?? []) {
        g.edge([req, tech.id]);
      }
    }

    const svg = await toStream(toDot(g), {format: 'svg'});
    response.status(200);
    svg.pipe(response);
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

  @Get('variables')
  @ApiOperation({summary: 'Get all variables and their default values'})
  getVariables() {
    return getInitialVariables();
  }

  @Get('variables/effects')
  @ApiOperation({summary: 'Get all variables and the technologies and traits that affect them'})
  getVariablesEffects() {
    const variables = Object.fromEntries(Object.keys(getInitialVariables()).map(k => [k, [] as string[]]));
    for (const technology of [...Object.values(TECHNOLOGIES), ...Object.values(TRAITS)]) {
      for (const effect of technology.effects) {
        variables[effect.variable].push(technology.id);
      }
    }
    return variables;
  }
}
