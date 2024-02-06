import {Effect, EffectSource, ExplainedVariable, Variable} from './types';
import {Empire} from '../empire/empire.schema';
import {getEffectiveTechnologies, TECHNOLOGIES} from './technologies';
import {TRAITS} from './traits';

export function getEmpireEffectSources(empire: Empire): EffectSource[] {
  return [
    ...empire.traits.map(t => TRAITS[t]),
    ...getEffectiveTechnologies(empire.technologies.map(t => TECHNOLOGIES[t])),
  ];
}

export function calculateVariable(variable: Variable, initial: number, empire: Empire): number {
  const variables = {[variable]: initial};
  calculateVariables(variables, empire);
  return variables[variable];
}

export function calculateVariables(variables: Partial<Record<Variable, number>>, empire: Empire) {
  const sources = getEmpireEffectSources(empire);
  applyEffects(variables, sources.flatMap(source => source.effects));
}

function applyEffects(variables: Partial<Record<Variable, number>>, effects: readonly Effect[]) {
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

export function explainVariables(variables: Record<Variable, number>, sources: EffectSource[]): Record<Variable, ExplainedVariable> {
  const result = {} as Record<Variable, ExplainedVariable>;
  for (const variable of Object.keys(variables) as Variable[]) {
    result[variable] = explainVariable(variable, variables[variable], sources);
  }
  return result;
}

export function explainVariable(variable: Variable, initial: number, allSources: EffectSource[]): ExplainedVariable {
  const sources = allSources
    .map(source => ({id: source.id, effects: source.effects.filter(effect => effect.variable === variable)}))
    .filter(source => source.effects.length > 0);
  const mod = {[variable]: initial};
  applyEffects(mod as any, sources.flatMap(source => source.effects));
  return {variable, initial, sources, final: mod[variable]};
}
