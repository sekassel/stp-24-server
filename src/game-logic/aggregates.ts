import {System} from '../system/system.schema';
import {Empire} from '../empire/empire.schema';
import {GameLogicService} from './game-logic.service';
import {ApiProperty} from '@nestjs/swagger';
import {Variable} from './types';

export class AggregateFn {
  @ApiProperty({type: [String]})
  params: string[];

  compute: (service: GameLogicService, empire: Empire, systems: System[], params: Record<string, string>) => AggregateResult;
}

export class AggregateItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty({type: String})
  variable: Variable;
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
} as const satisfies Record<string, AggregateFn>;
export type AggregateId = keyof typeof AGGREGATES;
