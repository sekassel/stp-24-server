import {Effect, EffectSource, ExplainedVariable, type Technology, Variable} from './types';

export function applyTechnologies(variables: Record<Variable, number>, techs: readonly Technology[]) {
  const techIds = new Set(techs.map(tech => tech.id));
  const effects = techs.filter(tech => {
    if (!tech) {
      return false;
    }
    if (tech.precedes && tech.precedes.some(id => techIds.has(id))) {
      return false;
    }
    return true;
  }).flatMap(tech => tech.effects).filter(e => e.variable in variables);

  applyEffects(variables, effects);
}

export function applyEffects(variables: Record<Variable, number>, effects: readonly Effect[]) {
  // step 1: apply base
  for (const effect of effects) {
    variables[effect.variable] += effect.base ?? 0;
  }

  // step 2: apply multiplier
  for (const effect of effects) {
    variables[effect.variable] *= effect.multiplier ?? 1;
  }

  // step 3: apply bonus
  for (const effect of effects) {
    variables[effect.variable] += effect.bonus ?? 0;
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
