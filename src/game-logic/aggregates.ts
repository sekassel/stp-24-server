import {Empire} from '../empire/empire.schema';
import {ApiProperty} from '@nestjs/swagger';
import {Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
import {BadRequestException} from '@nestjs/common';
import {TECHNOLOGIES} from './technologies';
import {notFound} from '@mean-stream/nestx';
import {AggregateService} from './aggregate.service';

export class AggregateFn {
  description: string;
  params?: Record<string, string>;
  optionalParams?: Record<string, string>;

  compute: (service: AggregateService, empire: Empire, params: Record<string, string>) => AggregateResult | Promise<AggregateResult>;
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
    description: 'Calculates the total resources produced across the empire in a period',
    optionalParams: {
      resource: 'The resource to calculate, e.g. `energy` or `population`',
      system: 'System ID. Only calculate production of a specific system.',
    },
    compute: (service, empire, {resource, system}) => {
      if (resource && !RESOURCE_NAMES.includes(resource as ResourceName)) {
        throw new BadRequestException(`Invalid resource: ${resource}`);
      }
      return service.aggregateResourcesPeriodic(empire, system, resource as ResourceName);
    },
  },
  'empire.level.economy': {
    description: 'Calculates the total economy level of the empire',
    compute: (service, empire) => service.aggregateEconomy(empire),
  },
  'empire.compare.economy': {
    description: 'Calculates the economy level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, {compare}) => service.compare(empire, compare, empire => service.aggregateEconomy(empire)),
  },
  'empire.level.military': {
    description: 'Calculates the total military level of the empire',
    compute: (service, empire) => service.aggregateMilitary(empire),
  },
  'empire.compare.military': {
    description: 'Calculates the military level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, {compare}) => service.compare(empire, compare, empire => service.aggregateMilitary(empire)),
  },
  'empire.level.technology': {
    description: 'Calculates the total technology level of the empire',
    compute: (service, empire) => service.aggregateTechnology(empire),
  },
  'empire.compare.technology': {
    description: 'Calculates the technology level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, {compare}) => service.compare(empire, compare, empire => service.aggregateTechnology(empire)),
  },
  'technology.cost': {
    description: 'Calculates the total cost of a technology',
    params: {
      technology: 'The ID of the technology to calculate',
    },
    compute: (service, empire, {technology}) => service.aggregateTechCost(empire, TECHNOLOGIES[technology] ?? notFound(technology)),
  },
  'technology.time': {
    description: 'Calculates the total duration of a technology',
    params: {
      technology: 'The ID of the technology to calculate',
    },
    compute: (service, empire, {technology}) => service.aggregateTechTime(empire, TECHNOLOGIES[technology] ?? notFound(technology)),
  },
  'system.max_health': {
    description: 'Calculates the maximum health of a system',
    params: {
      system: 'The ID of the system to calculate',
    },
    compute: (service, empire, {system}) => service.aggregateSystemHealthOrDefense(empire, system, 'health'),
  },
  'system.defense': {
    description: 'Calculates the defense value of a system',
    params: {
      system: 'The ID of the system to calculate',
    },
    compute: (service, empire, {system}) => service.aggregateSystemHealthOrDefense(empire, system, 'defense'),
  },
  'fleet.power': {
    description: 'Calculates the total power of a fleet',
    params: {
      fleet: 'The ID of the fleet to calculate',
    },
    compute: (service, empire, {fleet}) => {
      return { // TODO Fleet power aggregate
        total: 0,
        items: [],
      };
    },
  },
};
export type AggregateId = keyof typeof AGGREGATES;
