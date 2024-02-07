import type {ResourceName} from './resources';
import {ApiProperty} from '@nestjs/swagger';
import {VARIABLES} from './variables';

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
  @ApiProperty({description: 'The additive bonus to apply to the variable before multipliers.'})
  base?: number;

  /** the multiplier to apply to the variable. */
  @ApiProperty({description: 'The multiplier to apply to the variable.'})
  multiplier?: number;

  /** the additive to apply to the variable after multipliers. */
  @ApiProperty({description: 'The additive bonus to apply to the variable after multipliers.'})
  bonus?: number;
}

export class EffectSource {
  @ApiProperty()
  id: string;

  /** the effects that this source provides. */
  @ApiProperty({description: 'The effects that this source provides.'})
  effects: readonly Effect[];
}

export class ExplainedVariable {
  @ApiProperty()
  variable: string;

  @ApiProperty({description: 'The initial value of the variable'})
  initial: number;

  @ApiProperty({description: 'The effect sources that contribute to the variable.'})
  sources: EffectSource[];

  @ApiProperty({description: 'The final value of the variable'})
  final: number;
}

export interface Technology extends EffectSource {
  id: string;
  /** the cost in research points */
  cost: number;
  /** ids of other technologies that must be researched first. */
  requires?: readonly string[];
  /** If the empire has the specified technologies, this technology will be unlocked, but has no effect */
  precedes?: readonly string[];

  effects: readonly Effect[];
}

export interface Trait extends EffectSource {
  id: string;
  /** the cost in trait points */
  cost: number;
  /** Cannot be selected if one of these traits is also present */
  conflicts?: readonly string[];

  effects: readonly Effect[];
}

export interface Resource {
  /** how many of this resource an empire starts with */
  starting?: number;
  /** how many credits for one unit of this resource */
  credit_value?: number;
}

export interface Building {
  cost: Partial<Record<ResourceName, number>>;
  upkeep: Partial<Record<ResourceName, number>>;
  production: Partial<Record<ResourceName, number>>;
}