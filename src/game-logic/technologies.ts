import type {Technology, TechnologyTag, Variable} from './types';

export const TECHNOLOGIES: Record<string, Technology> = {

  /**
   * Technologies for empire variables (market, pop, system)
   * */

  /**
   * Market technologies
   */


  /**
   * Pop technologies
   */

  /** pop growth colonized */
  pop_growth_colonized_1: { // increased pop growth on colonized systems
    id: 'pop_growth_colonized_1',
    tags: ['society', 'state'],
    cost: 200,
    precedes: ['pop_growth_colonized_2'],
    effects: [
      {
        description: '+5% $pop$ growth on colonized $system$',
        variable: 'empire.pop.growth.colonized',
        multiplier: 1.05,
      },
    ],
  },
  pop_growth_colonized_2: { // further increased pop growth on colonized systems
    id: 'pop_growth_colonized_2',
    tags: ['society', 'state'],
    cost: 400,
    requires: ['pop_growth_colonized_1'],
    precedes: ['pop_growth_colonized_3'],
    effects: [
      {
        description: '+10% $pop$ growth on colonized $system$',
        variable: 'empire.pop.growth.colonized',
        multiplier: 1.1,
      },
    ],
  },
  pop_growth_colonized_3: { // further increased pop growth on colonized systems
    id: 'pop_growth_colonized_3',
    tags: ['society', 'state'],
    cost: 800,
    requires: ['pop_growth_colonized_2'],
    effects: [
      {
        description: '+15% $pop$ growth on colonized $system$',
        variable: 'empire.pop.growth.colonized',
        multiplier: 1.15,
      },
    ],
  },

  /** pop growth upgraded */
  pop_growth_upgraded_1: { // increased pop growth on upgraded systems
    id: 'pop_growth_upgraded_1',
    tags: ['society', 'state'],
    cost: 200,
    precedes: ['pop_growth_upgraded_2'],
    effects: [
      {
        description: '+5% $pop$ growth on upgraded $system$',
        variable: 'empire.pop.growth.upgraded',
        multiplier: 1.05,
      },
    ],
  },
  pop_growth_upgraded_2: { // further increased pop growth on upgraded systems
    id: 'pop_growth_upgraded_2',
    tags: ['society', 'state'],
    cost: 400,
    requires: ['pop_growth_upgraded_1'],
    precedes: ['pop_growth_upgraded_3'],
    effects: [
      {
        description: '+10% $pop$ growth on upgraded $system$',
        variable: 'empire.pop.growth.upgraded',
        multiplier: 1.1,
      },
    ],
  },
  pop_growth_upgraded_3: { // further increased pop growth on upgraded systems
    id: 'pop_growth_upgraded_3',
    tags: ['society', 'state'],
    cost: 800,
    requires: ['pop_growth_upgraded_2'],
    effects: [
      {
        description: '+15% $pop$ growth on upgraded $system$',
        variable: 'empire.pop.growth.upgraded',
        multiplier: 1.15,
      },
    ],
  },

  /** pop growth developed */
  pop_growth_developed_1: { // increased pop growth on developed systems
    id: 'pop_growth_developed_1',
    tags: ['society', 'state'],
    cost: 200,
    precedes: ['pop_growth_developed_2'],
    effects: [
      {
        description: '+5% $pop$ growth on developed $system$',
        variable: 'empire.pop.growth.developed',
        multiplier: 1.05,
      },
    ],
  },
  pop_growth_developed_2: { // further increased pop growth on developed systems
    id: 'pop_growth_developed_2',
    tags: ['society', 'state'],
    cost: 400,
    requires: ['pop_growth_developed_1'],
    precedes: ['pop_growth_developed_3'],
    effects: [
      {
        description: '+10% $pop$ growth on developed $system$',
        variable: 'empire.pop.growth.developed',
        multiplier: 1.1,
      },
    ],
  },
  pop_growth_developed_3: { // further increased pop growth on developed systems
    id: 'pop_growth_developed_3',
    tags: ['society', 'state'],
    cost: 800,
    requires: ['pop_growth_developed_2'],
    effects: [
      {
        description: '+15% $pop$ growth on developed $system$',
        variable: 'empire.pop.growth.developed',
        multiplier: 1.15,
      },
    ],
  },

  /** pop food consumption / nutrition */
  nutrition_1: { // reduced pop food consumption
    id: 'nutrition_1',
    tags: ['society', 'biology'],
    cost: 200,
    precedes: ['nutrition_2'],
    effects: [
      {
        description: '-5% $food$ consumption per $pop$',
        variable: 'empire.pop.consumption.food',
        multiplier: 0.95,
      },
    ],
  },
  nutrition_2: { // further reduced pop food consumption
    id: 'nutrition_2',
    tags: ['society', 'biology'],
    cost: 400,
    requires: ['nutrition_1'],
    precedes: ['nutrition_3'],
    effects: [
      {
        description: '-10% $food$ consumption per $pop$',
        variable: 'empire.pop.consumption.food',
        multiplier: 0.9,
      },
    ],
  },
  nutrition_3: { // further reduced pop food consumption
    id: 'nutrition_3',
    tags: ['society', 'biology'],
    cost: 800,
    requires: ['nutrition_2'],
    precedes: ['nutrition_4'],
    effects: [
      {
        description: '-15% $food$ consumption per $pop$',
        variable: 'empire.pop.consumption.food',
        multiplier: 0.85,
      },
    ],
  },
  nutrition_4: { // further reduced pop food consumption
    id: 'nutrition_4',
    tags: ['society', 'biology'],
    cost: 1600,
    requires: ['nutrition_3'],
    effects: [
      {
        description: '-20% $food$ consumption per $pop$',
        variable: 'empire.pop.consumption.food',
        multiplier: 0.8,
      },
    ],
  },

  /** pop: unemployed cost / social benefits */
  social_benefits_1: { // reduced unemployed pop cost
    id: 'social_benefits_1',
    tags: ['society', 'state'],
    cost: 200,
    precedes: ['social_benefits_2'],
    effects: [
      {
        description: '-5% $credits$ per unemployed $pop$',
        variable: 'empire.pop.consumption.credits.unemployed',
        multiplier: 0.95,
      },
    ],
  },
  social_benefits_2: { // further reduced unemployed pop cost
    id: 'social_benefits_2',
    tags: ['society', 'state'],
    cost: 400,
    requires: ['social_benefits_1'],
    precedes: ['social_benefits_3'],
    effects: [
      {
        description: '-10% $credits$ per unemployed $pop$',
        variable: 'empire.pop.consumption.credits.unemployed',
        multiplier: 0.9,
      },
    ],
  },
  social_benefits_3: { // further reduced unemployed pop cost
    id: 'social_benefits_3',
    tags: ['society', 'state'],
    cost: 800,
    requires: ['social_benefits_2'],
    precedes: ['social_benefits_4'],
    effects: [
      {
        description: '-15% $credits$ per unemployed $pop$',
        variable: 'empire.pop.consumption.credits.unemployed',
        multiplier: 0.85,
      },
    ],
  },
  social_benefits_4: { // further reduced unemployed pop cost
    id: 'social_benefits_4',
    tags: ['society', 'state'],
    cost: 1600,
    requires: ['social_benefits_3'],
    effects: [
      {
        description: '-20% $credits$ per unemployed $pop$',
        variable: 'empire.pop.consumption.credits.unemployed',
        multiplier: 0.8,
      },
    ],
  },

  /**
   * System technologies
   */

  /** system claims: colonizing, upgrading and developing systems */
  cheap_claims_1: { // reduced system claim costs
    id: 'cheap_claims_1',
    tags: ['society', 'state'],
    cost: 200,
    effects: [
      {
        description: '-25% $energy$ cost for $system$ claims',
        variable: 'empire.system.colonized.cost.energy',
        multiplier: 0.75,
      },
      {
        description: '-25% $minerals$ cost for $system$ claims',
        variable: 'empire.system.colonized.cost.minerals',
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
        variable: 'empire.system.upgraded.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $alloys$ cost for $system$ upgrades',
        variable: 'empire.system.upgraded.cost.alloys',
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
        variable: 'empire.system.developed.cost.alloys',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ cost for $system$ development',
        variable: 'empire.system.developed.cost.fuel',
        multiplier: 0.85,
      },
    ],
  },

  /** efficient colonizer: consumption reduction for colonized systems */
  efficient_colonizer_1: { // reduced system consumption upkeep
    id: 'efficient_colonizer_1',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 200,
    precedes: ['efficient_colonizer_2'],
    effects: [
      {
        description: '-10% $energy$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $fuel$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.fuel',
        multiplier: 0.9,
      },
      {
        description: '-10% $food$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.food',
        multiplier: 0.9,
      },
    ],
  },
  efficient_colonizer_2: { // further reduced system consumption upkeep
    id: 'efficient_colonizer_2',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 400,
    requires: ['efficient_colonizer_1'],
    precedes: ['efficient_colonizer_3'],
    effects: [
      {
        description: '-15% $energy$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.fuel',
        multiplier: 0.85,
      },
      {
        description: '-15% $food$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.food',
        multiplier: 0.85,
      },
    ],
  },
  efficient_colonizer_3: { // further reduced system consumption upkeep
    id: 'efficient_colonizer_3',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 800,
    requires: ['efficient_colonizer_2'],
    effects: [
      {
        description: '-20% $energy$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.energy',
        multiplier: 0.8,
      },
      {
        description: '-20% $fuel$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.fuel',
        multiplier: 0.8,
      },
      {
        description: '-20% $food$ upkeep for colonized $system$',
        variable: 'empire.system.colonized.consumption.food',
        multiplier: 0.8,
      },
    ],
  },

  /** pandora_conqueror: consumption reduction for upgraded systems */
  pandora_conqueror_1: { // reduced upgraded system consumption
    id: 'pandora_conqueror_1',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 200,
    precedes: ['pandora_conqueror_2'],
    effects: [
      {
        description: '-5% $energy$ upkeep for upgraded $system$',
        variable: 'empire.system.upgraded.consumption.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $fuel$ upkeep for upgraded $system$',
        variable: 'empire.system.upgraded.consumption.fuel',
        multiplier: 0.95,
      },
      {
        description: '-5% $food$ upkeep for upgraded $system$',
        variable: 'empire.system.upgraded.consumption.food',
        multiplier: 0.95,
      },
    ],
  },
  pandora_conqueror_2: { // further reduced upgraded system consumption
    id: 'pandora_conqueror_2',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 400,
    requires: ['pandora_conqueror_1'],
    precedes: ['pandora_conqueror_3'],
    effects: [
      {
        description: '-10% $energy$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.fuel',
        multiplier: 0.95,
      },
      {
        description: '-10% $food$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.food',
        multiplier: 0.9,
      },
    ],
  },
  pandora_conqueror_3: { // further reduced upgraded system consumption
    id: 'pandora_conqueror_3',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 800,
    requires: ['pandora_conqueror_2'],
    effects: [
      {
        description: '-15% $energy$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.fuel',
        multiplier: 0.85,
      },
      {
        description: '-15% $food$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.food',
        multiplier: 0.85,
      },
    ],
  },
  pandora_conqueror_4: { // further upgraded system consumption
    id: 'pandora_conqueror_4',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 1600,
    requires: ['pandora_conqueror_3'],
    effects: [
      {
        description: '-20% $energy$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.energy',
        multiplier: 0.8,
      },
      {
        description: '-20% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.fuel',
        multiplier: 0.8,
      },
      {
        description: '-20% $food$ upkeep for developed $system$',
        variable: 'empire.system.upgraded.consumption.food',
        multiplier: 0.8,
      },
    ],
  },

  /** galactus: developed system consumption reduction */
  galactus_1: { // reduced developed system consumption
    id: 'galactus_1',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 200,
    precedes: ['galactus_2'],
    effects: [
      {
        description: '-5% $energy$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.energy',
        multiplier: 0.95,
      },
      {
        description: '-5% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.fuel',
        multiplier: 0.95,
      },
      {
        description: '-5% $food$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.food',
        multiplier: 0.95,
      },
    ],
  },
  galactus_2: { // further reduced developed system consumption
    id: 'galactus_2',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 400,
    requires: ['galactus_1'],
    precedes: ['galactus_3'],
    effects: [
      {
        description: '-10% $energy$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.energy',
        multiplier: 0.9,
      },
      {
        description: '-10% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.fuel',
        multiplier: 0.9,
      },
      {
        description: '-10% $food$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.food',
        multiplier: 0.9,
      },
    ],
  },
  galactus_3: { // further reduced developed system consumption
    id: 'galactus_3',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 800,
    requires: ['galactus_2'],
    precedes: ['galactus_4'],
    effects: [
      {
        description: '-15% $energy$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.fuel',
        multiplier: 0.85,
      },
      {
        description: '-15% $food$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.food',
        multiplier: 0.85,
      },
    ],
  },
  galactus_4: { // further reduced developed system consumption
    id: 'galactus_4',
    tags: ['biology', 'energy', 'propulsion'],
    cost: 1600,
    requires: ['galactus_3'],
    effects: [
      {
        description: '-20% $energy$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.energy',
        multiplier: 0.8,
      },
      {
        description: '-20% $fuel$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.fuel',
        multiplier: 0.8,
      },
      {
        description: '-20% $food$ upkeep for developed $system$',
        variable: 'empire.system.developed.consumption.food',
        multiplier: 0.8,
      },
    ],
  },

  /** buildings: reduce initial cost */
  cheap_buildings_1: { // reduced basic building costs
    id: 'cheap_buildings_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    precedes: ['cheap_buildings_2'],
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

  /** buildings: reduce energy upkeep */
  efficient_buildings_1: { // reduced basic building energy upkeep
    id: 'efficient_buildings_1',
    tags: ['engineering', 'energy'],
    cost: 200,
    precedes: ['efficient_buildings_2'],
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

  /** buildings: increase production */
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

  /** buildings: reduce mineral upkeep */
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
generate_sequence('pop_growth_colonized', ['society', 'biology'], 'empire.pop.growth.colonized', '$pop$ growth per $time$ on colonized $system$', {multiplierIncrement: +0.025});
generate_sequence('pop_growth_upgraded', ['society', 'biology'], 'empire.pop.growth.upgraded', '$pop$ growth per $time$ on upgraded $system$', {multiplierIncrement: +0.025});
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
