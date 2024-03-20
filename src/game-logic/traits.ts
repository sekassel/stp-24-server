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

  /** mine: mineral production */
  strong: { // minor mineral production bonus
    id: 'strong',
    cost: 1,
    conflicts: ['weak'],
    effects: [
      {
        description: '+5% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.05,
      },
    ],
  },
  weak: { // minor mineral production penalty
    id: 'weak',
    cost: -1,
    conflicts: ['strong'],
    effects: [
      {
        description: '-5% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.95,
      },
    ],
  },

  /** research_lab: research production */
  dumb: { // minor research penalty, tiny fuel and alloy production bonus
    id: 'dumb',
    cost: -1,
    conflicts: ['smart', 'intelligent'],
    effects: [
      {
        description: '-5% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.95,
      },
      {
        description: '+0.5% $resources.alloys$ from $buildings.foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.005,
      },
      {
        description: '+0.5% $resources.fuel$ from $buildings.refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.005,
      },
    ],
  },
  smart: { // minor research bonus
    id: 'smart',
    cost: 1,
    conflicts: ['dumb', 'intelligent'],
    effects: [
      {
        description: '+5% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
    ],
  },
  intelligent: { // major research bonus
    id: 'intelligent',
    cost: 3,
    conflicts: ['dumb', 'smart'],
    effects: [
      {
        description: '+10% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
    ],
  },

  /** farm: food production */
  agrarian: { // minor food production bonus, minor initial energy penalty
    id: 'agrarian',
    cost: 1,
    conflicts: ['urban', 'gentrified', 'industrious'],
    effects: [
      {
        description: 'Start with 200 additional $resources.food$',
        variable: 'resources.food.starting',
        bonus: 200,
      },
      {
        description: 'Start with 20 reduced $resources.energy$',
        variable: 'resources.energy.starting',
        bonus: -20,
      },
      {
        description: '+5% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.05,
      },
    ],
  },
  urban: { // minor food production penalty
    id: 'urban',
    cost: -1,
    conflicts: ['agrarian', 'industrious', 'gentrified'],
    effects: [
      {
        description: '-5% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.95,
      },
    ],
  },
  industrious: { // major food production bonus, minor initial fuel bonus
    id: 'industrious',
    cost: 3,
    conflicts: ['urban', 'gentrified', 'agrarian'],
    effects: [
      {
        description: '+10% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.1,
      },
      {
        description: 'Start with 20 additional $resources.fuel$',
        variable: 'resources.fuel.starting',
        bonus: 20,
      },
    ],
  },
  gentrified: { // major food production penalty
    id: 'gentrified',
    cost: -3,
    conflicts: ['agrarian', 'industrious', 'urban'],
    effects: [
      {
        description: '-10% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.9,
      },
    ],
  },

  /** power_plant: energy production bonus */
  radioactive: { // minor energy production bonus, minor food production penalty
    id: 'radioactive',
    cost: 1,
    conflicts: ['ecological', 'nature_loving', 'green', 'chernobylian', 'tsaristic'],
    effects: [
      {
        description: '+10% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.1,
      },
      {
        description: '-3% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.97,
      },
    ],
  },
  chernobylian: { // moderate energy production bonus, moderate food production penalty
    id: 'chernobylian',
    cost: 2,
    conflicts: ['ecological', 'nature_loving', 'green', 'radioactive', 'tsaristic'],
    effects: [
      {
        description: '+20% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.2,
      },
      {
        description: '-6% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.94,
      },
    ],
  },
  tsaristic: { // major energy production bonus, major food production penalty
    id: 'tsaristic',
    cost: 3,
    conflicts: ['ecological', 'nature_loving', 'green', 'radioactive', 'chernobylian'],
    effects: [
      {
        description: '+30% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.3,
      },
      {
        description: '-10% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.9,
      },
    ],
  },

  /** power_plant: energy production penalty */
  ecological: { // minor energy production penalty
    id: 'ecological',
    cost: -1,
    conflicts: ['radioactive', 'chernobylian', 'tsaristic', 'nature_loving', 'green'],
    effects: [
      {
        description: '-5% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.95,
      },
    ],
  },
  nature_loving: { // moderate energy production penalty
    id: 'nature_loving',
    cost: -2,
    conflicts: ['radioactive', 'chernobylian', 'tsaristic', 'ecological', 'green'],
    effects: [
      {
        description: '-10% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.9,
      },
    ],
  },
  green: { // major energy production penalty
    id: 'green',
    cost: -3,
    conflicts: ['radioactive', 'chernobylian', 'tsaristic', 'ecological', 'nature_loving'],
    effects: [
      {
        description: '-15% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** all buildings: initial cost reduction */
  proficient: { // minor initial cost reduction
    id: 'proficient',
    cost: 2,
    conflicts: ['clumsy', 'incompetent', 'skilled'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ for $buildings.power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $resources.minerals$ for $buildings.mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $resources.minerals$ for $buildings.research_lab$',
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $resources.minerals$ for $buildings.foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $resources.minerals$ for $buildings.refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  skilled: { // moderate initial cost reduction
    id: 'skilled',
    cost: 4,
    conflicts: ['clumsy', 'incompetent', 'proficient'],
    effects: [
      {
        description: '-20% initial $resources.minerals$ for $buildings.power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $resources.minerals$ for $buildings.mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $resources.minerals$ for $buildings.research_lab$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $resources.minerals$ for $buildings.foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.8,
      },
      {
        description: '-20% initial $resources.minerals$ for $buildings.refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },

  /** all buildings: initial cost increase */
  clumsy: { // minor initial cost increase
    id: 'clumsy',
    cost: -2,
    conflicts: ['proficient', 'skilled', 'incompetent'],
    effects: [
      {
        description: '+10% initial $resources.minerals$ cost for $buildings.power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% initial $resources.minerals$ for $buildings.mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% initial $resources.minerals$ for $buildings.research_lab$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% initial $resources.minerals$ for $buildings.foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% initial $resources.minerals$ for $buildings.refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 1.1,
      },
    ],
  },
  incompetent: { // moderate initial cost increase
    id: 'incompetent',
    cost: -4,
    conflicts: ['proficient', 'skilled'],
    effects: [
      {
        description: '+20% initial $resources.minerals$ for $buildings.power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '+20% initial $resources.minerals$ for $buildings.mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '+20% initial $resources.minerals$ for $buildings.research_lab$',
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '+20% initial $resources.minerals$ for $buildings.foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 1.2,
      },
      {
        description: '+20% initial $resources.minerals$ for $buildings.refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 1.2,
      },
    ],
  },

  /** mine: increased mineral production */
  miner: { // minor mineral production bonus
    id: 'miner',
    cost: 1,
    conflicts: ['settler', 'surface_operator', 'claustrophobic', 'excavator', 'pitman'],
    effects: [
      {
        description: '+10% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.1,
      },
    ],
  },
  excavator: { // moderate mineral production bonus
    id: 'excavator',
    cost: 2,
    conflicts: ['settler', 'surface_operator', 'claustrophobic', 'miner', 'pitman'],
    effects: [
      {
        description: '+20% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.2,
      },
    ],
  },
  pitman: { // major mineral production bonus
    id: 'pitman',
    cost: 3,
    conflicts: ['settler', 'surface_operator', 'claustrophobic', 'miner', 'excavator'],
    effects: [
      {
        description: '+30% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.3,
      },
    ],
  },

  /** mine: reduced mineral production
   * farm: increased food production */
  settler: { // minor mineral production penalty; minor food production bonus
    id: 'settler',
    cost: -1,
    conflicts: ['miner', 'excavator', 'pitman', 'surface_operator', 'claustrophobic'],
    effects: [
      {
        description: '-10% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.9,
      },
      {
        description: '+2% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.02,
      },
    ],
  },
  surface_operator: { // moderate mineral production penalty; moderate food production bonus
    id: 'surface_operator',
    cost: -2,
    conflicts: ['miner', 'excavator', 'pitman', 'settler', 'claustrophobic'],
    effects: [
      {
        description: '-20% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.8,
      },
      {
        description: '+4% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.04,
      },
    ],
  },
  claustrophobic: { // major mineral production penalty; major food production bonus
    id: 'claustrophobic',
    cost: -3,
    conflicts: ['miner', 'excavator', 'pitman', 'settler', 'surface_operator'],
    effects: [
      {
        description: '-30% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.7,
      },
      {
        description: '+6% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.06,
      },
    ],
  },

  /** research_lab: increased research production; additional initial energy */
  assistant_technician: { // minor research production bonus; minor initial energy bonus
    id: 'assistant_technician',
    cost: 1,
    conflicts: ['amateur', 'beginner', 'technician', 'dilettante'],
    effects: [
      {
        description: 'Start with 100 additional $resources.energy$',
        variable: 'resources.energy.starting',
        bonus: 100,
      },
      {
        description: '+5% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
      {
        description: '-0.5% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.995,
      },
      {
        description: '-0.5% $resources.alloys$ from $buildings.foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 0.995,
      },
    ],
  },
  technician: { // major research production bonus; additional initial energy
    id: 'technician',
    cost: 2,
    conflicts: ['beginner', 'amateur', 'assistant_technician', 'dilettante'],
    effects: [
      {
        description: 'Start with 300 additional $resources.energy$',
        variable: 'resources.energy.starting',
        bonus: 300,
      },
      {
        description: '+10% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
      {
        description: '-1% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.99,
      },
      {
        description: '-1% $resources.alloys$ from $buildings.foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 0.99,
      },
    ],
  },
  beginner: { // minor fuel and research production penalty
    id: 'beginner',
    cost: -1,
    conflicts: ['technician', 'assistant_technician', 'amateur', 'dilettante'],
    effects: [
      {
        description: '-2% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.98,
      },
      {
        description: '-2% $resources.fuel$ from $buildings.refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.98,
      },
    ],
  },
  amateur: { // moderate fuel and research production penalty
    id: 'amateur',
    cost: -2,
    conflicts: ['assistant_technician', 'technician', 'beginner', 'dilettante'],
    effects: [
      {
        description: '-4% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.96,
      },
      {
        description: '-4% $resources.fuel$ from $buildings.refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.96,
      },
    ],
  },
  dilettante: { // minor production penalties for all resources
    id: 'dilettante',
    cost: -3,
    conflicts: ['assistant_technician', 'technician', 'beginner', 'amateur'],
    effects: [
      {
        description: '-2% $resources.research$ from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 0.96,
      },
      {
        description: '-2% $resources.fuel$ from $buildings.refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 0.96,
      },
      {
        description: '-2% $resources.energy$ from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 0.96,
      },
      {
        description: '-1% $resources.minerals$ from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 0.96,
      },
      {
        description: '-1% $resources.food$ from $buildings.farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 0.96,
      },
    ],
  },
};
