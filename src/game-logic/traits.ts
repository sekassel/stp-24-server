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
        variable: 'buildings.mine.production.minerals',
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
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.95,
      },
    ],
  },
  dumb: {
    id: '_dumb',
    cost: -1,
    conflicts: ['smart', 'intelligent'],
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
    id: 'smart',
    cost: 1,
    conflicts: ['dumb'],
    effects: [
      {
        description: '+5% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
    ],
  },
  intelligent: {
    id: 'intelligent',
    cost: 3,
    conflicts: ['dumb'],
    effects: [
      {
        description: '+10% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
    ],
  },
  cunning: {
    id: 'cunning',
    cost: 3,
    conflicts: ['courageous'],
    effects: [
      {
        description: '-5% $energy$ for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  courageous: {
    id: 'courageous',
    cost: 3,
    conflicts: ['cunning'],
    effects: [
      {
        description: '-5% $minerals$ for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.95,
      },
    ],
  },
  agrarian: {
    id: 'agrarian',
    cost: 1,
    conflicts: ['urban', 'gentrified'],
    effects: [
      {
        description: 'Start with 200 additional $food$',
        variable: 'resources.food.starting',
        bonus: 200,
      },
      {
        description: 'Start with 20 reduced $energy$',
        variable: 'resources.energy.starting',
        bonus: -20,
      },
      {
        description: '+5% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.05,
      },
    ],
  },
  urban: {
    id: 'urban',
    cost: -1,
    conflicts: ['agrarian', 'industrious'],
    effects: [
      {
        description: '-5% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.95,
      },
    ],
  },
  industrious: {
    id: 'industrious',
    cost: 3,
    conflicts: ['urban', 'gentrified'],
    effects: [
      {
        description: '+10% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.1,
      },
      {
        description: 'Start with 20 additional $fuel$',
        variable: 'resources.fuel.starting',
        bonus: 20,
      },
    ],
  },
  gentrified: {
    id: 'gentrified',
    cost: -3,
    conflicts: ['agrarian', 'industrious'],
    effects: [
      {
        description: '-10% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.9,
      },
    ],
  },
  radioactive: {
    id: 'radioactive',
    cost: 1,
    conflicts: ['ecological', 'nature_loving', 'green'],
    effects: [
      {
        description: '+10% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.05,
      },
      {
        description: '-3% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.98,
      },
    ],
  },
  chernobylian: {
    id: 'chernobylian',
    cost: 3,
    conflicts: ['ecological', 'nature_loving', 'green'],
    effects: [
      {
        description: '+20% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.2,
      },
      {
        description: '-6% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.94,
      },
    ],
  },
  tsaristic: {
    id: 'tsaristic',
    cost: 5,
    conflicts: ['ecological', 'nature_loving', 'green'],
    effects: [
      {
        description: '+30% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.3,
      },
      {
        description: '-10% $food$ from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.9,
      },
    ],
  },
  ecological: {
    id: 'ecological',
    cost: -1,
    conflicts: ['radioactive', 'chernobylian', 'tsaristic'],
    effects: [
      {
        description: '-5% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.95,
      },
    ],
  },
  nature_loving: {
    id: 'nature_loving',
    cost: -3,
    conflicts: ['radioactive', 'chernobylian', 'tsaristic'],
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
    conflicts: ['radioactive', 'chernobylian', 'tsaristic'],
    effects: [
      {
        description: '-15% $energy$ from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.85,
      },
    ],
  },
  proficient: {
    id: 'proficient',
    cost: 2,
    conflicts: ['clumsy', 'incompetent'],
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
    id: 'skilled',
    cost: 4,
    conflicts: ['clumsy', 'incompetent'],
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
    id: 'clumsy',
    cost: 2,
    conflicts: ['proficient', 'skilled'],
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
    id: 'incompetent',
    cost: -4,
    conflicts: ['proficient', 'skilled'],
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
    id: 'efficient',
    cost: 3,
    conflicts: ['inefficient', 'baboon'],
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
    id: 'engineer',
    cost: 6,
    conflicts: ['inefficient', 'baboon'],
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
    id: 'inefficient',
    cost: -3,
    conflicts: ['efficient', 'engineer'],
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
    id: 'baboon',
    cost: -6,
    conflicts: ['efficient', 'engineer'],
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
    id: 'miner',
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
    id: 'excavator',
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
    id: 'pitman',
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
    id: 'settler',
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
    id: 'surface_operator',
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
    id: 'claustrophobic',
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
  assistant_technician: {
    id: 'assistant_technician',
    cost: 1,
    conflicts: ['amateur'],
    effects: [
      {
        description: '5% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
      {
        description: '-0.5% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.995,
      },
      {
        description: '-0.5% $alloys$ from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 0.995,
      },
    ],
  },
  technician: {
    id: 'technician',
    cost: 3,
    conflicts: ['beginner', 'amateur'],
    effects: [
      {
        description: 'Start with 300 additional $energy$',
        variable: 'resources.energy.starting',
        bonus: 300,
      },
      {
        description: '10% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
      {
        description: '-1% $minerals$ from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.99,
      },
      {
        description: '-1% $alloys$ from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 0.99,
      },
      {
        description: '-1% $alloys$ from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 0.99,
      },
    ],
  },
  beginner: {
    id: 'beginner',
    cost: -1,
    conflicts: ['technician'],
    effects: [
      {
        description: '-2% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.98,
      },
      {
        description: '-2% $fuel$ from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.98,
      },
    ],
  },
  amateur: {
    id: 'amateur',
    cost: -3,
    conflicts: ['assistant_technician', 'technician'],
    effects: [
      {
        description: '-4% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.96,
      },
      {
        description: '-4% $fuel$ from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.96,
      },
    ],
  },
  dilettante: {
    id: 'dilettante',
    cost: -7,
    conflicts: ['assistant_technician', 'technician'],
    effects: [
      {
        description: '-4% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.96,
      },
      {
        description: '-4% $fuel$ from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.96,
      },
      {
        description: '-4% $research$ from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.96,
      },
      {
        description: '-4% $fuel$ from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.96,
      },
    ],
  },
};
