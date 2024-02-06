import type {Trait} from './types';
import {MAX_TRAIT_POINTS, MAX_TRAITS} from './constants';

export function generateTraits(): string[] {
  const traits: string[] = [];
  let traitPoints = MAX_TRAIT_POINTS;

  for (let i = 0; i < MAX_TRAITS * 2 && traits.length < MAX_TRAIT_POINTS; i++) {
    const trait = Object.values(TRAITS).random();
    if (traitPoints > trait.cost && !trait.conflicts?.some(c => traits.includes(c))) {
      traits.push(trait.id);
      traitPoints -= trait.cost;
    }
  }
  return traits;
}

export function checkTraits(traitIds: string[]): string[] {
  const result: string[] = [];
  const traits = traitIds.map(id => TRAITS[id]);
  const totalCost = traits.map(t => t.cost).sum();
  if (totalCost > MAX_TRAIT_POINTS) {
    result.push(`Maximum trait points exceeded (${totalCost}/${MAX_TRAIT_POINTS})`);
  }
  for (const trait of traits) {
    if (!trait.conflicts) {
      continue;
    }
    for (const conflict of trait.conflicts) {
      if (traitIds.includes(conflict)) {
        result.push(`Conflicting traits: ${trait.id} / ${conflict}`);
      }
    }
  }
  return result;
}

export const TRAITS: Record<string, Trait> = {
  strong: {
    id: 'strong',
    cost: 1,
    conflicts: ['weak'],
    effects: [
      {
        description: '+5% $minerals$ from $mine$',
        variable: 'mine.production.minerals',
        multiplier: 1.05,
      },
    ],
  },
  weak: {
    id: 'weak',
    cost: -1,
    conflicts: ['strong'],
    effects: [
      {
        description: '-5% $minerals$ from $mine$',
        variable: 'mine.production.minerals',
        multiplier: 0.95,
      },
    ],
  },
  smart: {
    id: 'smart',
    cost: 1,
    conflicts: ['intelligent'],
    effects: [
      {
        description: '+5% $research$ from $research_lab$',
        variable: 'research_lab.production.research',
        multiplier: 1.05,
      },
    ],
  },
  intelligent: {
    id: 'intelligent',
    cost: 3,
    conflicts: ['smart'],
    effects: [
      {
        description: '+10% $research$ from $research_lab$',
        variable: 'research_lab.production.research',
        multiplier: 1.1,
      },
    ],
  },
};
