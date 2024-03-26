import {System} from '../system/system.schema';
import {Empire} from '../empire/empire.schema';
import {GameLogicService} from './game-logic.service';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
import {BadRequestException} from '@nestjs/common';
import {TECHNOLOGIES} from './technologies';
import {notFound} from '@mean-stream/nestx';

export class AggregateFn {
  @ApiProperty({type: [String]})
  params: string[];

  @ApiPropertyOptional({type: [String]})
  optionalParams?: string[];

  compute: (service: GameLogicService, empire: Empire, systems: System[], params: Record<string, string>) => AggregateResult | Promise<AggregateResult>;
}

export class AggregateItem {
  @ApiProperty({type: String})
  variable: Variable | string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  subtotal: number;
}

export class AggregateResult {
  @ApiProperty()
  total: number;

  @ApiProperty({type: [AggregateItem]})
  items: AggregateItem[];
}

export const AGGREGATES: Record<string, AggregateFn> = {
  'resources.periodic': {
    params: ['resource'],
    optionalParams: ['system'],
    compute: (service, empire, systems, {resource, system}) => {
      if (!RESOURCE_NAMES.includes(resource as ResourceName)) {
        throw new BadRequestException(`Invalid resource: ${resource}`);
      }
      if (system) {
        systems = systems.filter(s => s._id.equals(system));
      }
      if (resource === 'population') {
        return service.aggregatePopGrowth(empire, systems);
      }
      return service.aggregateResources(empire, systems, [resource as ResourceName])[0];
    },
  },
  'empire.level.economy': {
    params: [],
    compute: (service, empire, systems) => service.aggregateEconomy(empire, systems),
  },
  'empire.compare.economy': {
    params: ['compare'],
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateEconomy.bind(service)),
  },
  'empire.level.military': {
    params: [],
    compute: (service, empire, systems) => service.aggregateMilitary(empire, systems),
  },
  'empire.compare.military': {
    params: ['compare'],
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateMilitary.bind(service)),
  },
  'empire.level.technology': {
    params: [],
    compute: (service, empire, systems) => service.aggregateTechnology(empire, systems),
  },
  'empire.compare.technology': {
    params: ['compare'],
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateTechnology.bind(service)),
  },
  'technology.cost': {
    params: ['technology'],
    compute: (service, empire, systems, {technology}) => {
      const tech = TECHNOLOGIES[technology] ?? notFound(technology);
      return service.aggregateTechCost(empire, tech);
    },
  }
};
export type AggregateId = keyof typeof AGGREGATES;
