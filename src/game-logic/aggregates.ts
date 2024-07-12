import {Empire} from '../empire/empire.schema';
import {ApiProperty} from '@nestjs/swagger';
import {Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
import {BadRequestException} from '@nestjs/common';
import {TECHNOLOGIES} from './technologies';
import {notFound} from '@mean-stream/nestx';
import {AggregateService} from './aggregate.service';
import {System} from '../system/system.schema';

export class AggregateFn {
  description: string;
  params?: Record<string, string>;
  optionalParams?: Record<string, string>;

  compute: (service: AggregateService, empire: Empire, systems: System[], params: Record<string, string>) => AggregateResult | Promise<AggregateResult>;
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
    compute: (service, empire, systems, {resource, system}) => {
      if (resource && !RESOURCE_NAMES.includes(resource as ResourceName)) {
        throw new BadRequestException(`Invalid resource: ${resource}`);
      }
      if (system) {
        systems = systems.filter(s => s._id.equals(system));
      }
      if (resource) {
        return service.aggregateResources(empire, systems, [resource as ResourceName])[0];
      } else {
        return service.aggregateAllResources(empire, systems);
      }
    },
  },
  'empire.level.economy': {
    description: 'Calculates the total economy level of the empire',
    compute: (service, empire, systems) => service.aggregateEconomy(empire, systems),
  },
  'empire.compare.economy': {
    description: 'Calculates the economy level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateEconomy.bind(service)),
  },
  'empire.level.military': {
    description: 'Calculates the total military level of the empire',
    compute: (service, empire, systems) => service.aggregateMilitary(empire, systems),
  },
  'empire.compare.military': {
    description: 'Calculates the military level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateMilitary.bind(service)),
  },
  'empire.level.technology': {
    description: 'Calculates the total technology level of the empire',
    compute: (service, empire, systems) => service.aggregateTechnology(empire, systems),
  },
  'empire.compare.technology': {
    description: 'Calculates the technology level of the empire compared to another empire as a logarithmic difference',
    params: {
      compare: 'The ID of the empire to compare to',
    },
    compute: (service, empire, systems, {compare}) => service.compare(empire, systems, compare, service.aggregateTechnology.bind(service)),
  },
  'technology.cost': {
    description: 'Calculates the total cost of a technology',
    params: {
      technology: 'The ID of the technology to calculate',
    },
    compute: (service, empire, systems, {technology}) => {
      const tech = TECHNOLOGIES[technology] ?? notFound(technology);
      return service.aggregateTechCost(empire, tech);
    },
  },
  'technology.time': {
    description: 'Calculates the total duration of a technology',
    params: {
      technology: 'The ID of the technology to calculate',
    },
    compute: (service, empire, systems, {technology}) => {
      const tech = TECHNOLOGIES[technology] ?? notFound(technology);
      return service.aggregateTechTime(empire, tech);
    },
  },
  'system.max_health': {
    description: 'Calculates the maximum health of a system',
    params: {
      system: 'The ID of the system to calculate',
    },
    compute: (service, empire, systems, {system}) => {
      const sys = systems.find(s => s._id.equals(system)) ?? notFound(system);
      return service.aggregateSystemHealthOrDefense(empire, sys, 'health');
    },
  },
  'system.defense': {
    description: 'Calculates the defense value of a system',
    params: {
      system: 'The ID of the system to calculate',
    },
    compute: (service, empire, systems, {system}) => {
      const sys = systems.find(s => s._id.equals(system)) ?? notFound(system);
      return service.aggregateSystemHealthOrDefense(empire, sys, 'defense');
    },
  },
  'fleet.power': {
    description: 'Calculates the total power of a fleet',
    params: {
      fleet: 'The ID of the fleet to calculate',
    },
    compute: (service, empire, systems, {fleet}) => {
      return { // TODO Fleet power aggregate
        total: 0,
        items: [],
      };
    },
  },
};
export type AggregateId = keyof typeof AGGREGATES;
