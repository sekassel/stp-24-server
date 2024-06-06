import {Effect, EffectSource, ExplainedVariable, Variable} from './types';
import {Empire} from '../empire/empire.schema';
import {getEffectiveTechnologies, TECH_CATEGORIES, TECHNOLOGIES} from './technologies';
import {TRAITS} from './traits';
import {BUILDINGS} from './buildings';
import {EMPIRE_VARIABLES} from './empire-variables';
import {RESOURCES} from './resources';
import {DISTRICTS} from './districts';
import {SYSTEM_UPGRADES} from './system-upgrade';
import {SystemDocument} from '../system/system.schema';

export const VARIABLES = {
  districts: DISTRICTS,
  buildings: BUILDINGS,
  empire: EMPIRE_VARIABLES,
  systems: SYSTEM_UPGRADES,
  resources: RESOURCES,
  technologies: TECH_CATEGORIES,
} as const;

export function getInitialVariables(): Record<Variable, number> {
  return flatten(VARIABLES);
}

export function getVariables(prefix: keyof typeof VARIABLES): Record<Variable, number> {
  return flatten(VARIABLES[prefix], prefix + '.');
}

export function flatten(obj: any, prefix = '', into: any = {}): any {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      flatten(value, prefix + key + '.', into);
    } else if (typeof value === 'number') {
      into[prefix + key] = value;
    }
  }
  return into;
}

export function getInitialValue(variable: Variable): number {
  // deep key access
  let value: any = VARIABLES;
  for (const key of variable.split('.')) {
    value = value[key];
  }
  return value;
}

export type EmpireEffectSources = Pick<Empire, 'traits' | 'technologies' | 'effects'>;

export function getEmpireEffectSources(empire: EmpireEffectSources, system?: SystemDocument): EffectSource[] {
  return [
    ...empire.traits.map(t => TRAITS[t]),
    ...getEffectiveTechnologies(empire.technologies.map(t => TECHNOLOGIES[t]).filter(t => t)),
    ...empire.effects ?? [],
    ...system?.effects ?? [],
  ];
}

export function calculateVariable(variable: Variable, empire: EmpireEffectSources): number {
  const variables = {[variable]: getInitialValue(variable)};
  calculateVariables(variables, empire);
  return variables[variable];
}

export function calculateVariables(variables: Partial<Record<Variable, number>>, empire: EmpireEffectSources, system?: SystemDocument) {
  const sources = getEmpireEffectSources(empire, system);
  applyEffects(variables, sources.flatMap(source => source.effects));
}

export function applyEffects(variables: Partial<Record<Variable, number>>, effects: readonly Effect[]) {
  effects = effects.filter(effect => variables[effect.variable] !== undefined);

  // step 1: apply base
  for (const effect of effects) {
    variables[effect.variable]! += effect.base ?? 0;
  }

  // step 2: apply multiplier
  for (const effect of effects) {
    variables[effect.variable]! *= effect.multiplier ?? 1;
  }

  // step 3: apply bonus
  for (const effect of effects) {
    variables[effect.variable]! += effect.bonus ?? 0;
  }
}

export function explainVariable(variable: Variable, allSources: EffectSource[], initial = getInitialValue(variable)): ExplainedVariable {
  const sources = allSources
    .map(source => ({id: source.id, effects: source.effects.filter(effect => effect.variable === variable)}))
    .filter(source => source.effects.length > 0);
  const mod = {[variable]: initial};
  applyEffects(mod as any, sources.flatMap(source => source.effects));
  return {variable, initial, sources, final: mod[variable]};
}
