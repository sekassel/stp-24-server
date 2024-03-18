import {System} from '../system/system.schema';
import {Empire} from '../empire/empire.schema';
import {GameLogicService} from './game-logic.service';
import {ApiProperty} from '@nestjs/swagger';
import {Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
import {BadRequestException} from '@nestjs/common';

export class AggregateFn {
  @ApiProperty({type: [String]})
  params: string[];

  compute: (service: GameLogicService, empire: Empire, systems: System[], params: Record<string, string>) => AggregateResult;
}

export class AggregateItem {
  @ApiProperty({type: String})
  variable: Variable;

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

export const AGGREGATES = {
  'resources.population.periodic': {
    params: [],
    compute: (service, empire, systems) => service.aggregatePopGrowth(empire, systems),
  },
  'system.resources.population.periodic': {
    params: ['system'],
    compute: (service, empire, systems, {system}) => service.aggregatePopGrowth(empire, systems.filter(s => s._id.equals(system))),
  },
  'resources.periodic': {
    params: ['resource'],
    compute: (service, empire, systems, {resource, system}) => {
      if (!RESOURCE_NAMES.includes(resource as ResourceName)) {
        throw new BadRequestException(`Invalid resource: ${resource}`);
      }
      if (system) {
        systems = systems.filter(s => s._id.equals(system));
      }
      return service.aggregateResource(empire, systems, resource as ResourceName);
    },
  },
} as const satisfies Record<string, AggregateFn>;
export type AggregateId = keyof typeof AGGREGATES;
