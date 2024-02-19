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
    id: '_strong',
    cost: 1,
    conflicts: ['_weak'],
    effects: [
      {
        description: '+5% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.05,
      },
    ],
  },
  weak: {
    id: '_weak',
    cost: -1,
    conflicts: ['_strong'],
    effects: [
      {
        description: '-5% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.95,
      },
    ],
  },
  dumb: {
    id: '_dumb',
    cost: -1,
    conflicts: ['_smart', '_intelligent'],
    effects: [
      {
        description: '-5% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.95,
      },
      {
        description: '+0.5% $alloys$ from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.005,
      },
      {
        description: '+0.5% $fuel$ from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.005,
      },
    ],
  },
  smart: {
    id: '_smart',
    cost: 1,
    conflicts: ['_intelligent'],
    effects: [
      {
        description: '+5% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
    ],
  },
  intelligent: {
    id: '_intelligent',
    cost: 3,
    conflicts: ['_smart'],
    effects: [
      {
        description: '+10% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
    ],
  },
  cunning: {
    id: '_cunning',
    cost: 3,
    conflicts: ['_courageous'],
    effects: [
      {
        description: '-5% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  courageous: {
    id: '_courageous',
    cost: 3,
    conflicts: ['_cunning'],
    effects: [
      {
        description: '-5% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.95,
      },
    ],
  },
  agrarian: {
    id: '_agrarian',
    cost: 1,
    conflicts: ['_urban', '_gentrified'],
    effects: [
      {
        description: '+5% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.05,
      },
    ],
  },
  urban: {
    id: '_urban',
    cost: -1,
    conflicts: ['_agrarian', '_industrious'],
    effects: [
      {
        description: '-5% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.97,
      },
    ],
  },
  industrious: {
    id: '_industrious',
    cost: 3,
    conflicts: ['_urban', '_gentrified'],
    effects: [
      {
        description: '+10% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.1,
      },
    ],
  },
  gentrified: {
    id: '_gentrified',
    cost: -3,
    conflicts: ['_agrarian', '_industrious'],
    effects: [
      {
        description: '-10% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.9,
      },
    ],
  },
  radioactive: {
    id: '_radioactive',
    cost: 1,
    conflicts: [],
    effects: [
      {
        description: '+5% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.05,
      },
    ],
  },
  chernobylian: {
    id: '_chernobylian',
    cost: 3,
    conflicts: [],
    effects: [
      {
        description: '+10% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.1,
      },
    ],
  },
  tsaristic: {
    id: '_tsaristic',
    cost: 5,
    conflicts: [],
    effects: [
      {
        description: '+15% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.15,
      },
    ],
  },
  ecological: {
    id: '_ecological',
    cost: -1,
    conflicts: ['_radioactive', '_chernobylian', '_tsaristic'],
    effects: [
      {
        description: '-5% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.95,
      },
    ],
  },
  nature_loving: {
    id: '_nature_loving',
    cost: -3,
    conflicts: ['_radioactive', '_chernobylian', '_tsaristic'],
    effects: [
      {
        description: '-10% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.9,
      },
    ],
  },
  green: {
    id: '_green',
    cost: -5,
    conflicts: ['_radioactive', '_chernobylian', '_tsaristic'],
    effects: [
      {
        description: '-15% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.85,
      },
    ],
  },
};
