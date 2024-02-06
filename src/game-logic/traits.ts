import type {Trait, Variable} from './types';
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
