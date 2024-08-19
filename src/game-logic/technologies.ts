import {Technology, TECHNOLOGY_TAGS, TechnologyTag, Variable} from './types';

export const TECH_CATEGORIES = Object.fromEntries(TECHNOLOGY_TAGS.map(tag => [tag, {
  cost_multiplier: 1,
  time_multiplier: 1,
}])) as Record<TechnologyTag, {
  cost_multiplier: number;
  time_multiplier: number;
}>;

export const TECHNOLOGIES: Record<string, Technology> = {

  /** Technologies for empire variables (market, pop, system) */

  /*********************************************************************************************************************
   * Pop Technologies
   ********************************************************************************************************************/

  economy_specialization: {
    id: 'economy_specialization',
    tags: ['society', 'economy'],
    cost: 1,
    effects: [
      {
        variable: 'technologies.economy.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.economy.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },

  ...generate_sequence(
    'unemployed_pop_cost',
    ['society', 'state'],
    'empire.pop.unemployed_upkeep.credits',
    {startCost: 2, multiplierIncrement: -0.1},
    ['economy_specialization'],
  ), // -10% -> -20% -> -30%

  /** empire: market fee reduction*/
  ...generate_sequence(
    'market_fee_reduction',
    ['society', 'economy'],
    'empire.market.fee',
    {startCost: 2, multiplierIncrement: -0.05},
    ['economy_specialization'],
  ),

  biology_specialization: {
    id: 'biology_specialization',
    tags: ['society', 'biology'],
    cost: 1,
    effects: [
      {
        variable: 'technologies.biology.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.biology.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },
  ...generate_sequence(
    'pop_food_consumption',
    ['society', 'biology'],
    'empire.pop.consumption.food',
    {startCost: 2, multiplierIncrement: -0.05},
    ['biology_specialization'],
  ),
  ...generate_sequence(
    'pop_growth_colonized',
    ['society', 'biology'],
    'systems.colonized.pop_growth',
    {startCost: 2, multiplierIncrement: +0.1}, // pop growth is already a multiplier, so it will be 0.05 -> 0.05 * 1.1 = 0.055 -> 0.05 * 1.2 = 0.06
    ['biology_specialization'],
  ),
  ...generate_sequence(
    'pop_growth_upgraded',
    ['society', 'biology'],
    'systems.upgraded.pop_growth',
    {startCost: 2, multiplierIncrement: +0.1},
    ['biology_specialization'],
  ),

  /*********************************************************************************************************************
   * System Technologies
   ********************************************************************************************************************/

  system_specialization: {
    id: 'system_specialization',
    tags: ['society', 'state'],
    cost: 1,
    effects: [
      {
        variable: 'technologies.state.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.state.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },

  /** colonists: increased pops (colonists) at system start */
  more_colonists_1: {
    id: 'more_colonists_1',
    tags: ['society', 'biology'],
    cost: 2,
    requires: ['system_specialization'],
    precedes: ['more_colonists_2'],
    effects: [
      {
        variable: 'empire.pop.colonists',
        base: 2,
      },
    ],
  },
  more_colonists_2: {
    id: 'more_colonists_2',
    tags: ['society', 'biology'],
    cost: 3,
    precedes: ['more_colonists_3'],
    requires: ['more_colonists_1'],
    effects: [
      {
        variable: 'empire.pop.colonists',
        base: 3,
      },
    ],
  },
  more_colonists_3: {
    id: 'more_colonists_3',
    tags: ['society', 'biology'],
    cost: 4,
    requires: ['more_colonists_2'],
    effects: [
      {
        variable: 'empire.pop.colonists',
        base: 4,
      },
    ],
  },

  /** system claims: colonizing, upgrading and developing systems */
  cheap_claims_1: { // reduced system claim costs
    id: 'cheap_claims_1',
    tags: ['society', 'state'],
    cost: 2,
    requires: ['system_specialization'],
    effects: [
      {
        variable: 'systems.colonized.cost.energy',
        multiplier: 0.75,
      },
      {
        variable: 'systems.colonized.cost.minerals',
        multiplier: 0.75,
      },
    ],
  },
  cheap_claims_2: { // reduced system upgrade costs
    id: 'cheap_claims_2',
    tags: ['society', 'state'],
    cost: 3,
    requires: ['cheap_claims_1'],
    effects: [
      {
        variable: 'systems.upgraded.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'systems.upgraded.cost.alloys',
        multiplier: 0.85,
      },
    ],
  },
  cheap_claims_3: { // reduced system development costs
    id: 'cheap_claims_3',
    tags: ['society', 'state'],
    cost: 4,
    requires: ['cheap_claims_2'],
    effects: [
      {
        variable: 'systems.developed.cost.alloys',
        multiplier: 0.85,
      },
      {
        variable: 'systems.developed.cost.fuel',
        multiplier: 0.85,
      },
    ],
  },

  /** systems: reduced upkeep for colonized, upgraded and developed systems */
  efficient_systems_1: {
    id: 'efficient_systems_1',
    tags: ['physics', 'energy'],
    cost: 2,
    requires: ['system_specialization'],
    effects: [
      {
        variable: 'systems.colonized.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'systems.upgraded.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'systems.developed.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_systems_2: {
    id: 'efficient_systems_2',
    tags: ['physics', 'propulsion'],
    cost: 3,
    requires: ['efficient_systems_1'],
    effects: [
      {
        variable: 'systems.colonized.upkeep.fuel',
        multiplier: 0.9,
      },
      {
        variable: 'systems.upgraded.upkeep.fuel',
        multiplier: 0.9,
      },
      {
        variable: 'systems.developed.upkeep.fuel',
        multiplier: 0.9,
      },
    ],
  },
  efficient_systems_3: {
    id: 'efficient_systems_3',
    tags: ['engineering', 'materials'],
    cost: 4,
    requires: ['efficient_systems_2'],
    effects: [
      {
        variable: 'systems.colonized.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        variable: 'systems.upgraded.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        variable: 'systems.developed.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  efficient_systems_4: {
    id: 'efficient_systems_4',
    tags: ['engineering', 'materials'],
    cost: 5,
    requires: ['efficient_systems_3'],
    effects: [
      {
        variable: 'systems.upgraded.upkeep.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'systems.developed.upkeep.alloys',
        multiplier: 0.9,
      },
    ],
  },

  /** systems: reduced upgrade time */
  ...generate_sequence('faster_explored_system_upgrade', ['physics', 'computing'],
    'systems.explored.upgrade_time',
    {
      multiplierIncrement: -0.1,
      startCost: 2,
    },
    ['system_specialization'],
  ),
  ...generate_sequence('faster_colonized_system_upgrade', ['engineering', 'construction'],
    'systems.colonized.upgrade_time',
    {
      multiplierIncrement: -0.1,
      startCost: 2,
    },
    ['system_specialization'],
  ),
  ...generate_sequence('faster_upgraded_system_upgrade', ['engineering', 'construction'],
    'systems.upgraded.upgrade_time',
    {
      startCost: 3,
      multiplierIncrement: -0.1,
    }, ['faster_colonized_system_upgrade_1']),
  ...generate_sequence('faster_developed_system_upgrade', ['engineering', 'construction'],
    'systems.developed.upgrade_time',
    {
      startCost: 4,
      multiplierIncrement: -0.1,
    }, ['faster_upgraded_system_upgrade_1']),

  /*********************************************************************************************************************
   * Building Technologies
   ********************************************************************************************************************/

  building_specialization: {
    id: 'building_specialization',
    tags: ['engineering', 'production'],
    cost: 1,
    effects: [
      {
        variable: 'technologies.production.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.production.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },

  /** buildings: reduce initial cost */
  cheap_buildings_1: { // reduced basic building costs
    id: 'cheap_buildings_1',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['building_specialization'],
    effects: [
      {
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.mine.cost.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.farm.cost.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.factory.cost.minerals',
        multiplier: 0.85,
      },
    ],
  },
  cheap_buildings_2: { // reduced advanced building costs
    id: 'cheap_buildings_2',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['cheap_buildings_1'],
    effects: [
      {
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.exchange.cost.minerals',
        multiplier: 0.85,
      },
    ],
  },
  cheap_buildings_3: { // reduced advanced building costs
    id: 'cheap_buildings_3',
    tags: ['engineering', 'construction'],
    cost: 4,
    requires: ['cheap_buildings_2'],
    effects: [
      {
        variable: 'buildings.shipyard.cost.alloys',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.shipyard.cost.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.cost.alloys',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.cost.minerals',
        multiplier: 0.85,
      },
    ],
  },

  /** buildings: reduce energy upkeep */
  efficient_buildings_1: { // reduced basic building energy upkeep
    id: 'efficient_buildings_1',
    tags: ['physics', 'energy'],
    cost: 2,
    requires: ['building_specialization'],
    effects: [
      {
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.factory.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },
  efficient_buildings_2: { // reduced advanced building energy upkeep
    id: 'efficient_buildings_2',
    tags: ['physics', 'energy'],
    cost: 3,
    requires: ['efficient_buildings_1'],
    effects: [
      {
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.refinery.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.exchange.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.shipyard.upkeep.fuel',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.upkeep.fuel',
        multiplier: 0.85,
      },
    ],
  },
  efficient_buildings_3: {
    id: 'efficient_buildings_3',
    tags: ['engineering', 'construction'],
    cost: 4,
    requires: ['efficient_buildings_2'],
    effects: [
      {
        variable: 'buildings.exchange.upkeep.consumer_goods',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.research_lab.upkeep.consumer_goods',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.factory.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.shipyard.upkeep.alloys',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.shipyard.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.shipyard.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.upkeep.alloys',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.upkeep.energy',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.fortress.upkeep.minerals',
        multiplier: 0.85,
      },
    ],
  },

  /** buildings: decrease build time */
  faster_building_construction_1: {
    id: 'faster_building_construction_1',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['building_specialization'],
    effects: [
      {
        variable: 'buildings.farm.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.mine.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.power_plant.build_time',
        multiplier: 0.75,
      },
    ],
  },
  faster_building_construction_2: {
    id: 'faster_building_construction_2',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['faster_building_construction_1'],
    effects: [
      {
        variable: 'buildings.refinery.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.foundry.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.factory.build_time',
        multiplier: 0.75,
      },
    ],
  },
  faster_building_construction_3: {
    id: 'faster_building_construction_3',
    tags: ['engineering', 'construction'],
    cost: 4,
    requires: ['faster_building_construction_2'],
    effects: [
      {
        variable: 'buildings.exchange.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.research_lab.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.shipyard.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'buildings.fortress.build_time',
        multiplier: 0.75,
      },
    ],
  },

  /** buildings: increase production */
  improved_production_1: { // generally increased basic building production
    id: 'improved_production_1',
    tags: ['engineering', 'production'],
    cost: 2,
    requires: ['building_specialization'],
    precedes: ['improved_production_2'],
    effects: [
      {
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.farm.production.food',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.exchange.production.credits',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.factory.production.consumer_goods',
        multiplier: 1.05,
      },
    ],
  },
  improved_production_2: { // further increased basic building production
    id: 'improved_production_2',
    tags: ['engineering', 'production'],
    cost: 3,
    requires: ['improved_production_1'],
    // NOT precedes: ["improved_production_3"], improved_production_3 switches to advanced buildings, so the basic buildings should still be improved
    effects: [
      {
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.farm.production.food',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.exchange.production.credits',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.factory.production.consumer_goods',
        multiplier: 1.1,
      },
    ],
  },
  improved_production_3: { // increased advanced building production
    id: 'improved_production_3',
    tags: ['engineering', 'production'],
    cost: 4,
    requires: ['improved_production_2'],
    precedes: ['improved_production_4'],
    effects: [
      {
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.05,
      },
      {
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.05,
      },
    ],
  },
  improved_production_4: { // further increased advanced building production
    id: 'improved_production_4',
    tags: ['engineering', 'production'],
    cost: 5,
    requires: ['improved_production_3'],
    effects: [
      {
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.1,
      },
      {
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.1,
      },
    ],
  },

  /** buildings: reduce mineral upkeep */
  efficient_resources_1: { // reduced basic building upkeep
    id: 'efficient_resources_1',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['building_specialization'],
    precedes: ['efficient_resources_2'],
    effects: [
      {
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  efficient_resources_2: { // further reduced basic building upkeep
    id: 'efficient_resources_2',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['efficient_resources_1'],
    effects: [
      {
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.85,
      },
    ],
  },


  // basic resources
  ...generate_sequence('energy_production', ['physics', 'energy'],
    'buildings.power_plant.production.energy',
    {startCost: 2},
    ['building_specialization'],
  ),
  ...generate_sequence('mineral_production', ['engineering', 'production'],
    'buildings.mine.production.minerals',
    {startCost: 2},
    ['building_specialization'],
  ),
  ...generate_sequence('food_production', ['society', 'biology'],
    'buildings.farm.production.food',
    {startCost: 2},
    ['building_specialization'],
  ),
  // advanced resources
  ...generate_sequence('research_production', ['physics', 'computing'],
    'buildings.research_lab.production.research',
    {startCost: 2},
    ['building_specialization'],
  ),
  ...generate_sequence('alloy_production', ['engineering', 'materials'],
    'buildings.foundry.production.alloys',
    {startCost: 2},
    ['building_specialization'],
  ),
  ...generate_sequence('fuel_production', ['engineering', 'production'],
    'buildings.refinery.production.fuel',
    {startCost: 2},
    ['building_specialization'],
  ),

  /*********************************************************************************************************************
   * District Technologies
   ********************************************************************************************************************/

  /** all districts: unlock district specialization */
  district_specialization: {
    id: 'district_specialization',
    tags: ['engineering', 'construction'],
    cost: 1,
    effects: [
      {
        variable: 'technologies.construction.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.construction.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },
  district_production_increase: {
    id: 'district_production_increase',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['district_specialization'],
    effects: [],
  },
  ancient_district_production_increase: {
    id: 'ancient_district_production_increase',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['district_production_increase'],
    effects: [],
  },
  district_cost_reduction: {
    id: 'district_cost_reduction',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['district_specialization'],
    effects: [],
  },
  ancient_district_cost_reduction: {
    id: 'ancient_district_cost_reduction',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['district_cost_reduction'],
    effects: [],
  },
  district_upkeep_reduction: {
    id: 'district_upkeep_reduction',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['district_specialization'],
    effects: [],
  },
  ancient_district_upkeep_reduction: {
    id: 'ancient_district_upkeep_reduction',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['district_upkeep_reduction'],
    effects: [],
  },

  /** all districts: activate ancient military, industry and technology */
  ancient_mastery: {
    id: 'ancient_mastery',
    tags: ['engineering', 'construction', 'rare'],
    cost: 2,
    requires: ['district_specialization'],
    effects: [],
  },

  /** all districts: chance for ancient military */
  ancient_military_activation: {
    id: 'ancient_military_activation',
    tags: ['society', 'military', 'rare'],
    cost: 3,
    requires: ['ancient_mastery'],
    effects: [],
  },
  ...generate_sequence(
    'ancient_military',
    ['society', 'military', 'rare'],
    ['districts.research_site.chance.ancient_military', 'districts.ancient_foundry.chance.ancient_military', 'districts.ancient_refinery.chance.ancient_military'],
    {startCost: 4},
    ['ancient_military_activation'],
  ),

  /** all districts: chance for ancient industry */
  ancient_industry_activation: {
    id: 'ancient_industry_activation',
    tags: ['engineering', 'production', 'rare'],
    cost: 3,
    requires: ['ancient_mastery'],
    effects: [],
  },
  ...generate_sequence(
    'ancient_industry',
    ['engineering', 'production', 'rare'],
    ['districts.research_site.chance.ancient_industry', 'districts.ancient_foundry.chance.ancient_industry', 'districts.ancient_refinery.chance.ancient_industry'],
    {startCost: 4},
    ['ancient_industry_activation'],
  ),

  /** all districts: chance for ancient technology */
  ancient_tech_activation: {
    id: 'ancient_tech_activation',
    tags: ['physics', 'computing', 'rare'],
    cost: 3,
    requires: ['ancient_mastery'],
    effects: [],
  },
  ...generate_sequence(
    'ancient_tech',
    ['physics', 'computing', 'rare'],
    ['districts.research_site.chance.ancient_technology', 'districts.ancient_foundry.chance.ancient_technology', 'districts.ancient_refinery.chance.ancient_technology'],
    {startCost: 4},
    ['ancient_tech_activation'],
  ),

  /** all districts: reduce build time */
  faster_district_construction_1: {
    id: 'faster_district_construction_1',
    tags: ['engineering', 'construction'],
    cost: 2,
    requires: ['district_specialization'],
    effects: [
      {
        variable: 'districts.mining.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.agriculture.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.energy.build_time',
        multiplier: 0.75,
      },
    ],
  },
  faster_district_construction_2: {
    id: 'faster_district_construction_2',
    tags: ['engineering', 'construction'],
    cost: 3,
    requires: ['faster_district_construction_1'],
    effects: [
      {
        variable: 'districts.city.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.industry.build_time',
        multiplier: 0.75,
      },
    ],
  },
  faster_district_construction_3: {
    id: 'faster_district_construction_3',
    tags: ['engineering', 'construction'],
    cost: 4,
    requires: ['faster_district_construction_2'],
    effects: [
      {
        variable: 'districts.ancient_foundry.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.ancient_factory.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.ancient_refinery.build_time',
        multiplier: 0.75,
      },
      {
        variable: 'districts.research_site.build_time',
        multiplier: 0.75,
      },
    ],
  },

  /** mining district: reduce initial mineral and energy cost */
  ...generate_sequence(
    'mining_foundation',
    ['physics', 'energy'],
    ['districts.mining.cost.minerals', 'districts.mining.cost.energy'],
    {startCost: 3, multiplierIncrement: -0.05},
    ['district_cost_reduction'],
  ),

  /** ancient_foundry: reduce energy and mineral upkeep */
  ...generate_sequence(
    'efficient_ancient_foundry',
    ['physics', 'energy'],
    ['districts.ancient_foundry.upkeep.minerals', 'districts.ancient_foundry.upkeep.energy'],
    {startCost: 4, multiplierIncrement: -0.05},
    ['ancient_district_upkeep_reduction'],
  ),

  /** ancient_refinery: reduce energy and mineral upkeep */
  ...generate_sequence(
    'efficient_ancient_refinery',
    ['physics', 'energy'],
    ['districts.ancient_refinery.upkeep.minerals', 'districts.ancient_refinery.upkeep.energy'],
    {startCost: 4, multiplierIncrement: -0.05},
    ['ancient_district_upkeep_reduction'],
  ),

  /** city: reduce upkeep */
  ...generate_sequence(
    'efficient_city',
    ['engineering', 'construction'],
    ['districts.city.upkeep.energy', 'districts.city.upkeep.consumer_goods'],
    {startCost: 3, multiplierIncrement: -0.05},
    ['district_upkeep_reduction'],
  ),

  /** industry: reduce upkeep */
  ...generate_sequence(
    'efficient_industry',
    ['engineering', 'construction'],
    ['districts.industry.upkeep.energy', 'districts.industry.upkeep.minerals'],
    {startCost: 3, multiplierIncrement: -0.05},
    ['district_upkeep_reduction'],
  ),

  /** industry: increase production */
  ...generate_sequence(
    'improved_industry',
    ['engineering', 'production'],
    ['districts.industry.production.alloys', 'districts.industry.production.consumer_goods', 'districts.industry.production.fuel'],
    {startCost: 3},
    ['district_production_increase'],
  ),

  // basic district resource production
  ...generate_sequence('energy_district_production', ['physics', 'energy'],
    'districts.energy.production.energy', {startCost: 3}, ['district_production_increase']),
  ...generate_sequence('mining_district_production', ['engineering', 'production'],
    'districts.mining.production.minerals',
    {startCost: 3}, ['district_production_increase']),
  ...generate_sequence('agriculture_district_production', ['society', 'biology'],
    'districts.agriculture.production.food',
    {startCost: 3}, ['district_production_increase']),
  // advanced district resource production
  ...generate_sequence('research_site_production', ['physics', 'computing'],
    'districts.research_site.production.research',
    {startCost: 4}, ['ancient_district_production_increase']),
  ...generate_sequence('ancient_foundry_production', ['engineering', 'materials'],
    'districts.ancient_foundry.production.alloys',
    {startCost: 4}, ['ancient_district_production_increase']),
  ...generate_sequence('ancient_refinery_production', ['physics', 'propulsion'],
    'districts.ancient_refinery.production.fuel',
    {startCost: 4}, ['ancient_district_production_increase']),
  /** city: credit production */
  ...generate_sequence('city_production', ['society', 'economy'],
    'districts.city.production.credits',
    {startCost: 3}, ['district_production_increase']),
  /** energy district: reduce initial mineral cost */
  ...generate_sequence('effective_energy', ['engineering', 'construction'],
    'districts.energy.cost.minerals',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_cost_reduction']),
  /** energy district: reduce mineral upkeep */
  ...generate_sequence('efficient_energy', ['engineering', 'construction'],
    'districts.energy.upkeep.minerals',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_upkeep_reduction']),
  /** mining district: reduce energy upkeep */
  ...generate_sequence('efficient_mining', ['physics', 'energy'], 'districts.mining.upkeep.energy',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_upkeep_reduction']),
  /** agricultural district: reduce initial energy cost */
  ...generate_sequence('agriculture_cost_reduction', ['physics', 'energy'],
    'districts.agriculture.cost.energy',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_cost_reduction']),
  /** agricultural district: reduce energy upkeep */
  ...generate_sequence('efficient_agriculture', ['physics', 'energy'],
    'districts.agriculture.upkeep.energy',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_upkeep_reduction']),
  /** research site: reduce initial mineral cost */
  ...generate_sequence('effective_lab_building', ['engineering', 'construction'],
    'districts.research_site.cost.minerals',
    {startCost: 4, multiplierIncrement: -0.1},
    ['ancient_district_cost_reduction']),
  /** research site: reduce energy upkeep */
  ...generate_sequence('efficient_research', ['physics', 'energy'],
    'districts.research_site.upkeep.energy',
    {startCost: 4, multiplierIncrement: -0.1},
    ['ancient_district_upkeep_reduction']),
  /** ancient_foundry: reduce initial mineral cost */
  ...generate_sequence('ancient_foundry_structure', ['engineering', 'construction'],
    'districts.ancient_foundry.cost.minerals',
    {startCost: 4, multiplierIncrement: -0.1},
    ['ancient_district_cost_reduction']),
  /** ancient_refinery: reduce initial mineral cost */
  ...generate_sequence('ancient_refinery_structure', ['engineering', 'construction'],
    'districts.ancient_refinery.cost.minerals',
    {startCost: 4, multiplierIncrement: -0.1},
    ['ancient_district_cost_reduction']),
  /** city: reduce initial mineral cost */
  ...generate_sequence('city_structure', ['engineering', 'construction'], 'districts.city.cost.minerals',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_cost_reduction']),
  /** industry: reduce initial mineral cost */
  ...generate_sequence('industry_structure', ['engineering', 'construction'], 'districts.industry.cost.minerals',
    {startCost: 3, multiplierIncrement: -0.1},
    ['district_cost_reduction']),

  /*********************************************************************************************************************
   * Ship Technologies
   ********************************************************************************************************************/

  ship_construction: {
    id: 'ship_construction',
    tags: ['engineering', 'shipmaking'],
    cost: 1,
    effects: [
      {
        variable: 'ships.explorer.build_time',
        multiplier: 0.8,
      },
      {
        variable: 'ships.colonizer.build_time',
        multiplier: 0.8,
      },
      {
        variable: 'technologies.shipmaking.cost_multiplier',
        multiplier: 0.9,
      },
      {
        variable: 'technologies.shipmaking.time_multiplier',
        multiplier: 0.9,
      },
    ],
  },

  /** Small */
  small_ship_construction: { // increase ship build time
    id: 'small_ship_construction',
    tags: ['engineering', 'shipmaking'],
    cost: 2,
    requires: ['ship_construction'],
    effects: [
      {
        variable: 'ships.corvette.build_time',
        base: 5,
      },
      {
        variable: 'ships.bomber.build_time',
        base: 5,
      },
      {
        variable: 'ships.frigate.build_time',
        base: 6,
      },
    ],
  },
  ...generate_sequence(
    'fast_small_ship_construction',
    ['engineering', 'shipmaking'],
    ['ships.corvette.build_time', 'ships.bomber.build_time', 'ships.frigate.build_time'],
    {startCost: 3, multiplierIncrement: -0.1},
    ['small_ship_construction'],
  ),

  /** Medium */
  medium_ship_construction: { // increase ship build time
    id: 'medium_ship_construction',
    tags: ['engineering', 'shipmaking'],
    cost: 3,
    requires: ['small_ship_construction'],
    effects: [
      {
        variable: 'ships.destroyer.build_time',
        base: 7,
      },
      {
        variable: 'ships.cruiser.build_time',
        base: 9,
      },
      {
        variable: 'ships.vanguard.build_time',
        base: 10,
      },
      {
        variable: 'ships.sentinel.build_time',
        base: 11,
      },
    ],
  },
  ...generate_sequence(
    'fast_medium_ship_construction',
    ['engineering', 'shipmaking'],
    ['ships.destroyer.build_time', 'ships.cruiser.build_time', 'ships.vanguard.build_time', 'ships.sentinel.build_time'],
    {startCost: 4, multiplierIncrement: -0.1},
    ['medium_ship_construction'],
  ),

  /** Large */
  large_ship_construction: { // increase ship build time
    id: 'large_ship_construction',
    tags: ['engineering', 'shipmaking'],
    cost: 4,
    requires: ['medium_ship_construction'],
    effects: [
      {
        variable: 'ships.battleship.build_time',
        base: 12,
      },
      {
        variable: 'ships.carrier.build_time',
        base: 15,
      },
      {
        variable: 'ships.dreadnought.build_time',
        base: 18,
      },
    ],
  },
  ...generate_sequence(
    'fast_large_ship_construction',
    ['engineering', 'shipmaking'],
    ['ships.battleship.build_time', 'ships.carrier.build_time', 'ships.dreadnought.build_time'],
    {startCost: 5, multiplierIncrement: -0.1},
    ['large_ship_construction'],
  ),

  armor_plating_1: { // increase ship health
    id: 'armor_plating_1',
    tags: ['engineering', 'materials'],
    cost: 2,
    requires: ['ship_construction'],
    effects: [
      {
        variable: 'ships.explorer.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.colonizer.health',
        multiplier: 1.2,
      },
    ],
  },
  armor_plating_2: {
    id: 'armor_plating_2',
    tags: ['engineering', 'materials'],
    cost: 3,
    requires: ['armor_plating_1', 'small_ship_construction'],
    effects: [
      {
        variable: 'ships.interceptor.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.fighter.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.corvette.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.bomber.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.frigate.health',
        multiplier: 1.2,
      },
    ],
  },
  armor_plating_3: {
    id: 'armor_plating_3',
    tags: ['engineering', 'materials'],
    cost: 4,
    requires: ['armor_plating_2', 'medium_ship_construction'],
    effects: [
      {
        variable: 'ships.destroyer.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.cruiser.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.vanguard.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.sentinel.health',
        multiplier: 1.2,
      },
    ],
  },
  armor_plating_4: {
    id: 'armor_plating_4',
    tags: ['engineering', 'materials'],
    cost: 5,
    requires: ['armor_plating_3', 'large_ship_construction'],
    effects: [
      {
        variable: 'ships.battleship.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.carrier.health',
        multiplier: 1.2,
      },
      {
        variable: 'ships.dreadnought.health',
        multiplier: 1.2,
      },
    ],
  },

  ship_speed_1: { // increase ship speed
    id: 'ship_speed_1',
    tags: ['physics', 'propulsion'],
    cost: 2,
    requires: ['ship_construction'],
    effects: [
      {
        variable: 'ships.explorer.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.colonizer.speed',
        multiplier: 1.2,
      },
    ],
  },
  ship_speed_2: {
    id: 'ship_speed_2',
    tags: ['physics', 'propulsion'],
    cost: 3,
    requires: ['ship_speed_1', 'small_ship_construction'],
    effects: [
      {
        variable: 'ships.interceptor.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.fighter.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.corvette.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.bomber.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.frigate.speed',
        multiplier: 1.2,
      },
    ],
  },
  ship_speed_3: {
    id: 'ship_speed_3',
    tags: ['physics', 'propulsion'],
    cost: 4,
    requires: ['ship_speed_2', 'medium_ship_construction'],
    effects: [
      {
        variable: 'ships.destroyer.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.cruiser.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.vanguard.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.sentinel.speed',
        multiplier: 1.2,
      },
    ],
  },
  ship_speed_4: {
    id: 'ship_speed_4',
    tags: ['physics', 'propulsion'],
    cost: 5,
    requires: ['ship_speed_3', 'large_ship_construction'],
    effects: [
      {
        variable: 'ships.battleship.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.carrier.speed',
        multiplier: 1.2,
      },
      {
        variable: 'ships.dreadnought.speed',
        multiplier: 1.2,
      },
    ],
  },

  cheap_ships_1: { // reduce ship cost
    id: 'cheap_ships_1',
    tags: ['engineering', 'shipmaking'],
    cost: 2,
    requires: ['ship_construction'],
    effects: [
      {
        variable: 'ships.explorer.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.explorer.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.colonizer.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.colonizer.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  cheap_ships_2: {
    id: 'cheap_ships_2',
    tags: ['engineering', 'shipmaking'],
    cost: 3,
    requires: ['cheap_ships_1', 'small_ship_construction'],
    effects: [
      {
        variable: 'ships.interceptor.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.interceptor.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.fighter.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.fighter.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.corvette.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.corvette.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.bomber.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.bomber.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.frigate.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.frigate.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  cheap_ships_3: {
    id: 'cheap_ships_3',
    tags: ['engineering', 'shipmaking'],
    cost: 4,
    requires: ['cheap_ships_2', 'medium_ship_construction'],
    effects: [
      {
        variable: 'ships.destroyer.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.destroyer.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.cruiser.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.cruiser.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.vanguard.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.vanguard.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.sentinel.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.sentinel.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  cheap_ships_4: {
    id: 'cheap_ships_4',
    tags: ['engineering', 'shipmaking'],
    cost: 5,
    requires: ['cheap_ships_3', 'large_ship_construction'],
    effects: [
      {
        variable: 'ships.battleship.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.battleship.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.carrier.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.carrier.cost.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.dreadnought.cost.alloys',
        multiplier: 0.9,
      },
      {
        variable: 'ships.dreadnought.cost.energy',
        multiplier: 0.9,
      },
    ],
  },

  efficient_ships_1: { // reduce ship upkeep
    id: 'efficient_ships_1',
    tags: ['physics', 'energy'],
    cost: 2,
    requires: ['ship_construction'],
    effects: [
      {
        variable: 'ships.explorer.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.colonizer.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_ships_2: {
    id: 'efficient_ships_2',
    tags: ['physics', 'energy'],
    cost: 3,
    requires: ['efficient_ships_1', 'small_ship_construction'],
    effects: [
      {
        variable: 'ships.interceptor.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.fighter.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.corvette.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.bomber.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.frigate.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_ships_3: {
    id: 'efficient_ships_3',
    tags: ['physics', 'energy'],
    cost: 4,
    requires: ['efficient_ships_2', 'medium_ship_construction'],
    effects: [
      {
        variable: 'ships.destroyer.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.cruiser.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.vanguard.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.sentinel.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_ships_4: {
    id: 'efficient_ships_4',
    tags: ['physics', 'energy'],
    cost: 5,
    requires: ['efficient_ships_3', 'large_ship_construction'],
    effects: [
      {
        variable: 'ships.battleship.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.carrier.upkeep.energy',
        multiplier: 0.9,
      },
      {
        variable: 'ships.dreadnought.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },

  small_fighters_1: { // increase ship attack
    id: 'small_fighters_1',
    tags: ['physics', 'weaponry'],
    cost: 3,
    requires: ['small_ship_construction'],
    precedes: ['small_fighters_2'],
    effects: [
      {
        variable: 'ships.interceptor.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.interceptor.attack.bomber',
        multiplier: 1.1,
      },
      {
        variable: 'ships.fighter.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.corvette.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.bomber.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.frigate.attack.default',
        multiplier: 1.1,
      },
    ],
  },
  small_fighters_2: {
    id: 'small_fighters_2',
    tags: ['physics', 'weaponry'],
    cost: 4,
    requires: ['small_fighters_1'],
    effects: [
      {
        variable: 'ships.interceptor.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.interceptor.attack.bomber',
        multiplier: 1.2,
      },
      {
        variable: 'ships.fighter.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.corvette.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.bomber.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.frigate.attack.default',
        multiplier: 1.2,
      },
    ],
  },
  medium_fighters_1: {
    id: 'medium_fighters_1',
    tags: ['physics', 'weaponry'],
    cost: 4,
    requires: ['small_fighters_1', 'medium_ship_construction'],
    precedes: ['medium_fighters_2'],
    effects: [
      {
        variable: 'ships.destroyer.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.cruiser.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.vanguard.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.sentinel.attack.default',
        multiplier: 1.1,
      },
    ],
  },
  medium_fighters_2: {
    id: 'medium_fighters_2',
    tags: ['physics', 'weaponry'],
    cost: 5,
    requires: ['medium_fighters_1'],
    effects: [
      {
        variable: 'ships.destroyer.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.cruiser.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.vanguard.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.sentinel.attack.default',
        multiplier: 1.2,
      },
    ],
  },
  large_fighters_1: {
    id: 'large_fighters_1',
    tags: ['physics', 'weaponry'],
    cost: 5,
    requires: ['medium_fighters_1', 'large_ship_construction'],
    precedes: ['large_fighters_2'],
    effects: [
      {
        variable: 'ships.battleship.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.carrier.attack.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.dreadnought.attack.default',
        multiplier: 1.1,
      },
    ],
  },
  large_fighters_2: {
    id: 'large_fighters_2',
    tags: ['physics', 'weaponry'],
    cost: 6,
    requires: ['large_fighters_1'],
    effects: [
      {
        variable: 'ships.battleship.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.carrier.attack.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.dreadnought.attack.default',
        multiplier: 1.2,
      },
    ],
  },

  small_ship_defense_1: { // increase ship defense
    id: 'small_ship_defense_1',
    tags: ['society', 'military'],
    cost: 3,
    requires: ['small_ship_construction'],
    precedes: ['small_ship_defense_2'],
    effects: [
      {
        variable: 'ships.interceptor.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.fighter.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.corvette.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.bomber.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.frigate.defense.default',
        multiplier: 1.1,
      },
    ],
  },
  small_ship_defense_2: {
    id: 'small_ship_defense_2',
    tags: ['society', 'military'],
    cost: 4,
    requires: ['small_ship_defense_1'],
    effects: [
      {
        variable: 'ships.interceptor.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.fighter.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.corvette.defense.default',
        multiplier: 1.2,
      },
    ],
  },
  medium_ship_defense_1: {
    id: 'medium_ship_defense_1',
    tags: ['society', 'military'],
    cost: 4,
    requires: ['small_ship_defense_1', 'medium_ship_construction'],
    precedes: ['medium_ship_defense_2'],
    effects: [
      {
        variable: 'ships.destroyer.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.cruiser.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.vanguard.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.sentinel.defense.default',
        multiplier: 1.1,
      },
    ],
  },
  medium_ship_defense_2: {
    id: 'medium_ship_defense_2',
    tags: ['society', 'military'],
    cost: 5,
    requires: ['medium_ship_defense_1'],
    effects: [
      {
        variable: 'ships.destroyer.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.cruiser.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.vanguard.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.sentinel.defense.default',
        multiplier: 1.2,
      },
    ],
  },
  large_ship_defense_1: {
    id: 'large_ship_defense_1',
    tags: ['society', 'military'],
    cost: 5,
    requires: ['medium_ship_defense_1', 'large_ship_construction'],
    precedes: ['large_ship_defense_2'],
    effects: [
      {
        variable: 'ships.battleship.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.carrier.defense.default',
        multiplier: 1.1,
      },
      {
        variable: 'ships.dreadnought.defense.default',
        multiplier: 1.1,
      },
    ],
  },
  large_ship_defense_2: {
    id: 'large_ship_defense_2',
    tags: ['society', 'military'],
    cost: 6,
    requires: ['large_ship_defense_1'],
    effects: [
      {
        variable: 'ships.battleship.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.carrier.defense.default',
        multiplier: 1.2,
      },
      {
        variable: 'ships.dreadnought.defense.default',
        multiplier: 1.2,
      },
    ],
  },

  /*********************************************************************************************************************
   * Misc Technologies
   ********************************************************************************************************************/

  ...generate_sequence('faster_research', ['physics', 'computing'], 'empire.technologies.research_time',
    {multiplierIncrement: -0.1}),
};

export const TECHNOLOGY_IDS = Object.keys(TECHNOLOGIES);

/**
 * Generates a sequence of technologies with increasing cost and effect.
 * @example
 * ...generate_sequence('energy_production', 'power_plant.production.energy', '$resources.energy$ from $buildings.power_plant$ per $period$');
 * // generates:
 * TECHNOLOGIES.energy_production_1 = {
 *   id: 'energy_production_1',
 *   cost: 1,
 *   precedes: ['energy_production_2'],
 *   effects: +5% $resources.energy$ from $buildings.power_plant$ per $period$',
 * },
 * TECHNOLOGIES.energy_production_2 = {
 *   id: 'energy_production_2',
 *   cost: 2,
 *   requires: ['energy_production_1'],
 *   precedes: ['energy_production_3'],
 *   effects: +10% $resources.energy$ from $buildings.power_plant$ per $period$',
 * },
 * TECHNOLOGIES.energy_production_3 = {
 *   id: 'energy_production_3',
 *   cost: 3,
 *   requires: ['energy_production_2'],
 *   effects: +15% $resources.energy$ from $buildings.power_plant$ per $period$',
 * }
 * @example
 * ...generate_sequence('unemployed_pop_cost', 'pop.consumption.credits.unemployed', '$resources.credits$ per unemployed $resources.population$ per $period$', {
 *   multiplierIncrement: -0.05,
 * });
 * // generates:
 * TECHNOLOGIES.unemployed_pop_cost_1 = {
 *   id: 'unemployed_pop_cost_1',
 *   cost: 1,
 *   precedes: ['unemployed_pop_cost_2'],
 *   effects: -5% $resources.credits$ per unemployed $resources.population$ per $period$',
 * },
 * TECHNOLOGIES.unemployed_pop_cost_2 = {
 *   id: 'unemployed_pop_cost_2',
 *   cost: 2,
 *   requires: ['unemployed_pop_cost_1'],
 *   precedes: ['unemployed_pop_cost_3'],
 *   effects: -10% $resources.credits$ per unemployed $resources.population$ per $period$',
 * },
 * TECHNOLOGIES.unemployed_pop_cost_3 = {
 *   id: 'unemployed_pop_cost_3',
 *   cost: 3,
 *   requires: ['unemployed_pop_cost_2'],
 *   effects: -15% $resources.credits$ per unemployed $resources.population$ per $period$',
 * }
 *
 * @param base_id the base ID, e.g. "energy_production"
 * @param tags the tags for the technology, e.g. ['physics', 'energy']
 * @param variable the variable to modify, e.g. "power_plant.production.energy"
 * @param variable_desc the description of the variable, e.g. "$resources.energy$ from $buildings.power_plant$ per $period$"
 * @param requirement the requirement for the first step, default undefined
 * @param multiplierIncrement the amount to increase the multiplier by each step, default +0.05
 * @param count the number of steps, default 3
 * @param startCost the cost of the first step, default 1
 */
function generate_sequence(
  base_id: string,
  tags: Technology['tags'],
  variable: Variable | Variable[],
  {
    multiplierIncrement = +0.05,
    count = 3,
    startCost = 1,
  } = {},
  requirement?: readonly string[],
): Record<string, Technology> {
  const variables = Array.isArray(variable) ? variable : [variable];
  const result: Record<string, Technology> = {};
  for (let index = 1; index <= count; index++) {
    const cost = startCost + (index - 1);
    const multiplier = 1 + multiplierIncrement * index;
    const id = base_id + '_' + index;
    result[id] = {
      id,
      tags,
      cost,
      requires: requirement && index == 1 ? requirement : (index > 1 ? [base_id + '_' + (index - 1)] : undefined),
      precedes: index < count ? [base_id + '_' + (index + 1)] : undefined,
      effects: variables.map(variable => ({
        variable,
        multiplier,
      })),
    };
  }
  return result;
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
