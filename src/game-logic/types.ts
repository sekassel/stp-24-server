import {ResourceName} from './resources';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {VARIABLES} from './variables';
import {SYSTEM_TYPES, SystemTypeName} from './system-types';
import {SchemaObject} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';

export type DeepNumberKeys<T> = T extends Record<string, any> ? {
  [K in keyof T]-?: T[K] extends object ? `${K & string}.${DeepNumberKeys<T[K]>}` : T[K] extends number ? K & string : never;
}[keyof T] : '';
export type Variable = DeepNumberKeys<typeof VARIABLES>;

export class Effect {
  /** the variable that is affected. */
  @ApiProperty({type: String, description: 'The variable that is affected.'})
  @IsString()
  @IsNotEmpty()
  variable: Variable;

  /** the additive to apply to the variable before multipliers */
  @ApiPropertyOptional({description: 'The additive bonus to apply to the variable before multipliers.'})
  @IsOptional()
  @IsNumber()
  base?: number;

  /** the multiplier to apply to the variable. */
  @ApiPropertyOptional({description: 'The multiplier to apply to the variable.', minimum: 0})
  @IsOptional()
  @IsNumber()
  @Min(0)
  multiplier?: number;

  /** the additive to apply to the variable after multipliers. */
  @ApiPropertyOptional({description: 'The additive bonus to apply to the variable after multipliers.'})
  @IsOptional()
  @IsNumber()
  bonus?: number;
}

export class EffectSource {
  @ApiProperty({
    description: 'A unique identifier. Does not include the type (trait, technology, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  /** the effects that this source provides. */
  @ApiProperty({
    type: [Effect],
    description: 'The effects that this source provides.',
  })
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Effect)
  effects: readonly Effect[];
}

export class ExplainedVariable {
  @ApiProperty({description: 'The affected variable.'})
  variable: string;

  @ApiProperty({description: 'The initial value of the variable (before effects, the same for all empires)'})
  initial: number;

  @ApiProperty({
    type: [EffectSource],
    description: 'The effect sources that contribute to the variable.',
  })
  sources: EffectSource[];

  @ApiProperty({description: 'The final value of the variable (after effects, specific to each empire)'})
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
export type TechnologyCategory = typeof TECHNOLOGY_TAGS[0 | 1 | 2];
export type TechnologyTag = typeof TECHNOLOGY_TAGS[number];

export class Technology extends EffectSource {
  @ApiProperty({
    description: 'The category, sub-category and other tags classifying this technology.',
    enum: TECHNOLOGY_TAGS,
  })
  tags: readonly [TechnologyCategory, ...TechnologyTag[]];

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

export const RESOURCES_SCHEMA_PROPERTIES = {
  example: {
    energy: 10,
    minerals: 20,
  },
  type: 'object',
  additionalProperties: {
    type: 'integer',
    default: 0,
    minimum: 0,
  },
};

export class SystemType {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The chance of generating this type of system.',
    type: 'integer',
    default: 0,
    minimum: 0,
  })
  chance: number;

  @ApiProperty({
    description: 'The minimum and maximum capacity for this type of system.',
    type: 'array',
    minItems: 2,
    maxItems: 2,
    items: {
      type: 'integer',
      minimum: 0,
    },
  })
  capacity_range: [number, number];

  @ApiProperty({
    description: 'The number of districts as a fraction of capacity for this type of system.',
    type: 'number',
    minimum: 0,
  })
  district_percentage: number;
}

export class SystemUpgrade {
  @ApiProperty()
  id: string;

  @ApiProperty()
  next?: string;

  @ApiProperty({
    description: 'The duration of the upgrade job, in periods.',
  })
  upgrade_time: number;

  @ApiProperty({
    description: 'The population growth rate of the system.',
  })
  pop_growth: number;

  @ApiProperty({
    description: 'The cost to upgrade the system, specified in various resources.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the system, specified in various resources, required to maintain its benefits.',
    ...RESOURCES_SCHEMA_PROPERTIES,
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
    description: 'The duration of the construction job, in periods.'
  })
  build_time: number;

  @ApiProperty({
    description: 'The cost to construct the building, specified in various resources.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the building, specified in various resources, required to maintain operation.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  upkeep: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The production output of the building, specified in various resources, that it contributes to the empire\'s economy.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  production: Partial<Record<ResourceName, number>>;
}

export class District {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The duration of the construction job, in periods.'
  })
  build_time: number;

  @ApiProperty({
    description: 'The chance of discovering this district when exploring a given type of system.',
    properties: Object.fromEntries(['default', ...Object.keys(SYSTEM_TYPES)].map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
    } satisfies SchemaObject])),
  })
  chance: Partial<Record<SystemTypeName | 'default', number>>;

  @ApiProperty({
    description: 'The cost to establish the district, specified in various resources.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  cost: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The ongoing upkeep of the district, specified in various resources, required to maintain its benefits.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  upkeep: Partial<Record<ResourceName, number>>;

  @ApiProperty({
    description: 'The production output of the district, specified in various resources, contributing to the empire\'s economy.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  production: Partial<Record<ResourceName, number>>;
}
