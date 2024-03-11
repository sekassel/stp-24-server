import type {Technology, TechnologyTag, Variable} from './types';

export const TECHNOLOGIES: Record<string, Technology> = {
  cheap_claims_1: { // reduced system claim costs
    id: 'cheap_claims_1',
    cost: 200,
    tags: ['society', 'state'],
    effects: [
      {
        description: '-25% $energy$ cost for $system$ claims',
        variable: 'systems.colonized.cost.energy',
        multiplier: 0.75,
      },
      {
        description: '-25% $minerals$ cost for $system$ claims',
        variable: 'systems.colonized.cost.minerals',
        multiplier: 0.75,
      },
    ],
  },
  cheap_claims_2: { // reduced system upgrade costs
    id: 'cheap_claims_2',
    tags: ['society', 'state'],
    cost: 400,
    requires: ['cheap_claims_1'],
    effects: [
      {
        description: '-15% $minerals$ cost for $system$ upgrades',
        variable: 'systems.upgraded.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $alloys$ cost for $system$ upgrades',
        variable: 'systems.upgraded.cost.alloys',
        multiplier: 0.85,
      },
    ],
  },
  cheap_claims_3: { // reduced system development costs
    id: 'cheap_claims_3',
    tags: ['society', 'state'],
    cost: 800,
    requires: ['cheap_claims_2'],
    effects: [
      {
        description: '-15% $alloys$ cost for $system$ development',
        variable: 'systems.developed.cost.alloys',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ cost for $system$ development',
        variable: 'systems.developed.cost.fuel',
        multiplier: 0.85,
      },
    ],
  },
  cheap_buildings_1: { // reduced basic building costs
    id: 'cheap_buildings_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    effects: [
      {
        description: '-15% $minerals$ cost for $power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $minerals$ cost for $mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ cost for $mine$',
        variable: 'buildings.mine.cost.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ cost for $farm$',
        variable: 'buildings.farm.cost.energy',
        multiplier: 0.85,
      },
    ],
  },
  cheap_buildings_2: { // reduced advanced building costs
    id: 'cheap_buildings_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['cheap_buildings_1'],
    effects: [
      {
        description: '-15% $minerals$ cost for $research_lab$',
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $minerals$ cost for $foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $minerals$ cost for $refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.85,
      },
    ],
  },
  efficient_buildings_1: { // reduced basic building energy upkeep
    id: 'efficient_buildings_1',
    tags: ['engineering', 'energy'],
    cost: 200,
    effects: [
      {
        description: '-15% $energy$ upkeep for $mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ upkeep for $farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },
  efficient_buildings_2: { // reduced advanced building energy upkeep
    id: 'efficient_buildings_2',
    tags: ['engineering', 'energy'],
    cost: 400,
    requires: ['efficient_buildings_1'],
    effects: [
      {
        description: '-15% $energy$ upkeep for $research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ upkeep for $foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ upkeep for $refinery$',
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },
  improved_production_1: { // generally increased basic building production
    id: 'improved_production_1',
    tags: ['engineering', 'production'],
    cost: 200,
    precedes: ['improved_production_2'],
    effects: [
      {
        description: '+5% $energy$ production from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.05,
      },
      {
        description: '+5% $minerals$ production from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.05,
      },
      {
        description: '+5% $food$ production from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.05,
      },
    ],
  },
  improved_production_2: { // further increased basic building production
    id: 'improved_production_2',
    tags: ['engineering', 'production'],
    cost: 400,
    requires: ['improved_production_1'],
    // NOT precedes: ["improved_production_3"], improved_production_3 switches to advanced buildings, so the basic buildings should still be improved
    effects: [
      {
        description: '+10% $energy$ production from $power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.1,
      },
      {
        description: '+10% $minerals$ production from $mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% $food$ production from $farm$',
        variable: 'buildings.farm.production.food',
        multiplier: 1.1,
      },
    ],
  },
  improved_production_3: { // increased advanced building production
    id: 'improved_production_3',
    tags: ['engineering', 'production'],
    cost: 800,
    requires: ['improved_production_2'],
    precedes: ['improved_production_4'],
    effects: [
      {
        description: '+5% $research$ production from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
      {
        description: '+5% $alloys$ production from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.05,
      },
      {
        description: '+5% $fuel$ production from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.05,
      },
    ],
  },
  improved_production_4: { // further increased advanced building production
    id: 'improved_production_4',
    tags: ['engineering', 'production'],
    cost: 1600,
    requires: ['improved_production_3'],
    effects: [
      {
        description: '+10% $research$ production from $research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
      {
        description: '+10% $alloys$ production from $foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.1,
      },
      {
        description: '+10% $fuel$ production from $refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.1,
      },
    ],
  },
  efficient_resources_1: { // reduced basic building upkeep
    id: 'efficient_resources_1',
    tags: ['engineering', 'production'],
    cost: 200,
    precedes: ['efficient_resources_2'],
    effects: [
      {
        description: '-10% $minerals$ upkeep for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $minerals$ upkeep for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $minerals$ upkeep for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  efficient_resources_2: { // further increased advanced building production
    id: 'efficient_resources_2',
    tags: ['engineering', 'production'],
    cost: 400,
    requires: ['efficient_resources_1'],
    effects: [
      {
        description: '-15% $minerals$ upkeep for $power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $minerals$ upkeep for $foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $minerals$ upkeep for $refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.85,
      },
    ],
  },
};

// special resources
generate_sequence('pop_food_consumption', ['society', 'biology'], 'empire.pop.consumption.food', '$food$ per $pop$ per $time$', {multiplierIncrement: -0.05});
// pop growth is already a multiplier, so it will be 1.05 -> 1.05 * 1.025 = 1.07625 -> 1.05 * 1.025^2 = 1.10390625
generate_sequence('pop_growth_colonized', ['society', 'biology'], 'systems.colonized.pop_growth', '$pop$ growth per $time$ on colonized $system$', {multiplierIncrement: +0.025});
generate_sequence('pop_growth_upgraded', ['society', 'biology'], 'systems.upgraded.pop_growth', '$pop$ growth per $time$ on upgraded $system$', {multiplierIncrement: +0.025});
generate_sequence('unemployed_pop_cost', ['society', 'state'], 'empire.pop.consumption.credits.unemployed', '$credits$ per unemployed $pop$ per $time$', {
  multiplierIncrement: -0.05,
  exponentialBase: 3,
}); // -5% -> -15% -> -45%
// basic resources
generate_sequence('energy_production', ['physics', 'energy'], 'buildings.power_plant.production.energy', '$energy$ from $power_plant$ per $time$');
generate_sequence('mineral_production', ['engineering', 'production'], 'buildings.mine.production.minerals', '$minerals$ from $mine$ per $time$');
generate_sequence('food_production', ['society', 'biology'], 'buildings.farm.production.food', '$food$ from $farm$ per $time$');
// advanced resources
generate_sequence('research_production', ['physics', 'computing'], 'buildings.research_lab.production.research', '$research$ from $research_lab$ per $time$');
generate_sequence('alloy_production', ['engineering', 'materials'], 'buildings.foundry.production.alloys', '$alloys$ from $foundry$ per $time$');
generate_sequence('fuel_production', ['engineering', 'production'], 'buildings.refinery.production.fuel', '$fuel$ from $refinery$ per $time$');

/**
 * Generates a sequence of technologies with increasing cost and effect.
 * @example
 * generate_sequence('energy_production', 'power_plant.production.energy', '$energy$ from $power_plant$ per $time$');
 * // generates:
 * TECHNOLOGIES.energy_production_1 = {
 *   id: 'energy_production_1',
 *   cost: 100,
 *   precedes: ['energy_production_2'],
 *   effects: +5% $energy$ from $power_plant$ per $time$',
 * },
 * TECHNOLOGIES.energy_production_2 = {
 *   id: 'energy_production_2',
 *   cost: 200,
 *   requires: ['energy_production_1'],
 *   precedes: ['energy_production_3'],
 *   effects: +10% $energy$ from $power_plant$ per $time$',
 * },
 * TECHNOLOGIES.energy_production_3 = {
 *   id: 'energy_production_3',
 *   cost: 400,
 *   requires: ['energy_production_2'],
 *   effects: +20% $energy$ from $power_plant$ per $time$',
 * }
 * @example
 * generate_sequence('unemployed_pop_cost', 'pop.consumption.credits.unemployed', '$credits$ per unemployed $pop$ per $time$', {
 *   multiplierIncrement: -0.05,
 *   exponentialBase: 3,
 * });
 * // generates:
 * TECHNOLOGIES.unemployed_pop_cost_1 = {
 *   id: 'unemployed_pop_cost_1',
 *   cost: 100,
 *   precedes: ['unemployed_pop_cost_2'],
 *   effects: -5% $credits$ per unemployed $pop$ per $time$',
 * },
 * TECHNOLOGIES.unemployed_pop_cost_2 = {
 *   id: 'unemployed_pop_cost_2',
 *   cost: 300, // here the cost is 3x the previous cost, because exponentialBase is 3
 *   requires: ['unemployed_pop_cost_1'],
 *   precedes: ['unemployed_pop_cost_3'],
 *   effects: -15% $credits$ per unemployed $pop$ per $time$', // 3x the previous effect
 * },
 * TECHNOLOGIES.unemployed_pop_cost_3 = {
 *   id: 'unemployed_pop_cost_3',
 *   cost: 900, // again 3x the previous cost
 *   requires: ['unemployed_pop_cost_2'],
 *   effects: -45% $credits$ per unemployed $pop$ per $time$',
 * }
 *
 * @param base_id the base ID, e.g. "energy_production"
 * @param variable the variable to modify, e.g. "power_plant.production.energy"
 * @param variable_desc the description of the variable, e.g. "$energy$ from $power_plant$ per $time$"
 * @param multiplierIncrement the amount to increase the multiplier by each step, default +0.05
 * @param exponentialBase the base of the exponential, default 2
 * @param count the number of steps, default 3
 * @param startCost the cost of the first step, default 100
 */
function generate_sequence(base_id: string, tags: TechnologyTag[], variable: Variable, variable_desc: string,
                           {multiplierIncrement = +0.05, exponentialBase = 2, count = 3, startCost = 100} = {},
) {
  for (let index = 1; index <= count; index++) {
    const exponential = exponentialBase ** (index - 1);
    const cost = startCost * exponential;
    const multiplier = 1 + multiplierIncrement * exponential;
    const id = base_id + '_' + index;
    TECHNOLOGIES[id] = {
      id,
      tags,
      cost,
      requires: index > 1 ? [base_id + '_' + (index - 1)] : undefined,
      precedes: index < count ? [base_id + '_' + (index + 1)] : undefined,
      effects: [
        {
          description: `${(multiplier - 1) * 100}% ${variable_desc}`,
          variable,
          multiplier,
        },
      ],
    };
  }
}

export function getEffectiveTechnologies(techs: readonly Technology[]) {
  const techIds = new Set(techs.map(tech => tech.id));
  return techs.filter(tech => {
    if (!tech) {
      return false;
    }
    if (tech.precedes && tech.precedes.some(id => techIds.has(id))) {
      return false;
    }
    return true;
  });
}
