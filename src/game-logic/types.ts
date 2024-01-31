import type {ResourceName} from './resources';
import {EMPIRE_VARIABLES} from './empire-variables';
import {BUILDINGS} from './buildings';

export type DeepNumberKeys<T> = T extends Record<string, any> ? {
  [K in keyof T]-?: T[K] extends object ? `${K & string}.${DeepNumberKeys<T[K]>}` : T[K] extends number ? K & string : never;
}[keyof T] : '';
export type BuildingVariable = DeepNumberKeys<typeof BUILDINGS>;
export type MiscVariable = DeepNumberKeys<typeof EMPIRE_VARIABLES>;
export type Variable = BuildingVariable | MiscVariable;

export interface Effect {
  /** a description of the effect. */
  description: string;
  /** the variable that is affected. */
  variable: Variable;
  /** the additive to apply to the variable before multipliers */
  base?: number;
  /** the multiplier to apply to the variable. */
  multiplier?: number;
  /** the additive to apply to the variable after multipliers. */
  bonus?: number;
}

export interface EffectSource {
  id: string;
  /** the effects that this source provides. */
  effects: readonly Effect[];
}

export interface ExplainedVariable {
  variable: string;
  initial: number;
  sources: EffectSource[];
  final: number;
}

export interface Technology extends EffectSource {
  id: string; // assigned later.
  /** the cost in research points */
  cost: number;
  /** ids of other technologies that must be researched first. */
  requires?: readonly string[];
  /** If the empire has the specified technologies, this technology will be unlocked, but has no effect */
  precedes?: readonly string[];

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
