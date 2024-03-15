import {ResourceName, RESOURCES} from './resources';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {VARIABLES} from './variables';
import {SYSTEM_TYPES, SystemType} from './system-types';
import {SchemaObject} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export type DeepNumberKeys<T> = T extends Record<string, any> ? {
  [K in keyof T]-?: T[K] extends object ? `${K & string}.${DeepNumberKeys<T[K]>}` : T[K] extends number ? K & string : never;
}[keyof T] : '';
export type Variable = DeepNumberKeys<typeof VARIABLES>;

export class Effect {
  /** a description of the effect. */
  @ApiProperty({description: 'A description of the effect.'})
  description: string;

  /** the variable that is affected. */
  @ApiProperty({description: 'The variable that is affected.'})
  variable: Variable;

  /** the additive to apply to the variable before multipliers */
  @ApiPropertyOptional({description: 'The additive bonus to apply to the variable before multipliers.'})
  base?: number;

  /** the multiplier to apply to the variable. */
  @ApiPropertyOptional({description: 'The multiplier to apply to the variable.'})
  multiplier?: number;

  /** the additive to apply to the variable after multipliers. */
  @ApiPropertyOptional({description: 'The additive bonus to apply to the variable after multipliers.'})
  bonus?: number;
}

export class EffectSource {
  @ApiProperty()
  id: string;

  /** the effects that this source provides. */
  @ApiProperty({
    type: [Effect],
    description: 'The effects that this source provides.',
  })
  effects: readonly Effect[];
}

export class ExplainedVariable {
  @ApiProperty()
  variable: string;

  @ApiProperty({description: 'The initial value of the variable'})
  initial: number;

  @ApiProperty({
    type: [EffectSource],
    description: 'The effect sources that contribute to the variable.',
  })
  sources: EffectSource[];

  @ApiProperty({description: 'The final value of the variable'})
  final: number;
}

export const TECHNOLOGY_TAGS = [
  'society',
  'physics',
  'engineering',
  // society
  'military', // for ships, weapons
  'economy', // for credits, market
  'state', // for population
  'biology', // for food, population
  // physics
  'energy', // for power
  'computing', // for research
  'propulsion', // for fuel and speed
  // engineering
  'materials', // for alloys, armor
  'construction', // for buildings, districts
  'production', // for mining, industry
  // special
  'rare',
] as const;
export type TechnologyTag = typeof TECHNOLOGY_TAGS[number];

export class Technology {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: TECHNOLOGY_TAGS,
  })
  tags: readonly TechnologyTag[];

  @ApiProperty({
    description: 'The cost in research points.',
  })
  cost: number;

  @ApiPropertyOptional({
    description: 'Ids of other technologies that must be researched first.',
  })
  requires?: readonly string[];

  @ApiPropertyOptional({
    description: 'If the empire has the specified technologies, this technology will be unlocked, but has no effect.',
  })
  precedes?: readonly string[];

  @ApiProperty({type: [Effect]})
  effects: readonly Effect[];
}

export class Trait extends EffectSource {
  @ApiProperty({
    description: 'The cost in trait points.',
  })
  cost: number;

  @ApiPropertyOptional({
    description: 'If one of these traits is also present, this trait cannot be selected.',
  })
  conflicts?: readonly string[];
}

export class Resource {
  @ApiPropertyOptional({description: 'how many of this resource an empire starts with'})
  starting?: number;
  @ApiPropertyOptional({description: 'how many credits for one unit of this resource'})
  credit_value?: number;
}

export const RESOURCES_SCHEMA_PROPERTIES = Object.fromEntries(Object.keys(RESOURCES).map(id => [id, {
  type: 'integer',
  default: 0,
  minimum: 0,
} satisfies SchemaObject]));

export class SystemUpgrade {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The population growth rate of the system.',
  })
  pop_growth: number;

  @ApiProperty({
    description: 'The cost to upgrade the system, specified in various resources.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the system, specified in various resources, required to maintain its benefits.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  upkeep: Partial<Record<ResourceName, number>>;

  @ApiPropertyOptional({
    description: 'The capacity multiplier of the system.',
  })
  capacity_multiplier?: number;
}

export class Building {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The cost to construct the building, specified in various resources.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the building, specified in various resources, required to maintain operation.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  upkeep: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The production output of the building, specified in various resources, that it contributes to the empire\'s economy.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  production: Partial<Record<ResourceName, number>>;
}

export class District {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The chance of discovering this district when exploring a given type of system.',
    properties: Object.fromEntries(['default', ...Object.keys(SYSTEM_TYPES)].map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
    } satisfies SchemaObject])),
  })
  chance: Partial<Record<SystemType | 'default', number>>;

  @ApiProperty({
    description: 'The cost to establish the district, specified in various resources.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the district, specified in various resources, required to maintain its benefits.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  upkeep: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The production output of the district, specified in various resources, contributing to the empire\'s economy.',
    properties: RESOURCES_SCHEMA_PROPERTIES,
  })
  production: Partial<Record<ResourceName, number>>;
}
