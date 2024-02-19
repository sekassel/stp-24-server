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
  proficient: {
    id: '_proficient',
    cost: 2,
    conflicts: ['_clumsy', '_incompetent'],
    effects: [
      {
        description: '-10% initial $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $minerals$ for $mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $minerals$ for $research_lab$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $minerals$ for $foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $minerals$ for $refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  skilled: {
    id: '_skilled',
    cost: 4,
    conflicts: ['_clumsy', '_incompetent'],
    effects: [
      {
        description: '-20% initial $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $minerals$ for $mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $minerals$ for $research_lab$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $minerals$ for $foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $minerals$ for $refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  clumsy: {
    id: '_clumsy',
    cost: 2,
    conflicts: ['_proficient', '_skilled'],
    effects: [
      {
        description: '10% initial $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% initial $minerals$ for $mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% initial $minerals$ for $research_lab$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% initial $minerals$ for $foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% initial $minerals$ for $refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 1.1,
      },
    ],
  },
  incompetent: {
    id: '_incompetent',
    cost: -4,
    conflicts: ['_proficient', '_skilled'],
    effects: [
      {
        description: '20% initial $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '20% initial $minerals$ for $mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '20% initial $minerals$ for $research_lab$',
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '20% initial $minerals$ for $foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '20% initial $minerals$ for $refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 1.2,
      },
    ],
  },
  efficient: {
    id: '_efficient',
    cost: 3,
    conflicts: ['_inefficient', '_baboon'],
    effects: [
      {
        description: '-5% $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ for $mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ for $farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ for $foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $minerals$ for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ for $refinery$',
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  engineer: {
    id: '_engineer',
    cost: 6,
    conflicts: ['_inefficient', '_baboon'],
    effects: [
      {
        description: '-10% $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ for $mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ for $farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ for $foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $minerals$ for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ for $refinery$',
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  inefficient: {
    id: '_inefficient',
    cost: -3,
    conflicts: ['_efficient', '_engineer'],
    effects: [
      {
        description: '5% $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 1.05,
      },
      {
        description: '5% $energy$ for $mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 1.05,
      },
      {
        description: '5% $energy$ for $farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 1.05,
      },
      {
        description: '5% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 1.05,
      },
      {
        description: '5% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 1.05,
      },
      {
        description: '5% $energy$ for $foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 1.05,
      },
      {
        description: '5% $minerals$ for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 1.05,
      },
      {
        description: '5% $energy$ for $refinery$',
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 1.05,
      },
    ],
  },
  baboon: {
    id: '_baboon',
    cost: -6,
    conflicts: ['_efficient', '_engineer'],
    effects: [
      {
        description: '10% $minerals$ for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% $energy$ for $mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 1.1,
      },
      {
        description: '10% $energy$ for $farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 1.1,
      },
      {
        description: '10% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 1.1,
      },
      {
        description: '10% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% $energy$ for $foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 1.1,
      },
      {
        description: '10% $minerals$ for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 1.1,
      },
      {
        description: '10% $energy$ for $refinery$',
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 1.1,
      },
    ],
  },
  miner: {
    id: '_miner',
    cost: 1,
    conflicts: ['settler', 'surface_operator', 'claustrophobic'],
    effects: [
      {
        description: '10% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.1,
      },
    ],
  },
  excavator: {
    id: '_excavator',
    cost: 3,
    conflicts: ['settler', 'surface_operator', 'claustrophobic'],
    effects: [
      {
        description: '20% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.2,
      },
    ],
  },
  pitman: {
    id: '_pitman',
    cost: 5,
    conflicts: ['settler', 'surface_operator', 'claustrophobic'],
    effects: [
      {
        description: '30% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.3,
      },
    ],
  },
  settler: {
    id: '_settler',
    cost: -1,
    conflicts: ['miner', 'excavator', 'pitman'],
    effects: [
      {
        description: '-10% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.9,
      },
    ],
  },
  surface_operator: {
    id: '_surface_operator',
    cost: -3,
    conflicts: ['miner', 'excavator', 'pitman'],
    effects: [
      {
        description: '-20% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.8,
      },
    ],
  },
  claustrophobic: {
    id: '_claustrophobic',
    cost: -5,
    conflicts: ['miner', 'excavator', 'pitman'],
    effects: [
      {
        description: '-30% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.7,
      },
    ],
  },
};
