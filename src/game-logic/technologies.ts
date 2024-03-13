import type {Technology, TechnologyTag, Variable} from './types';

export const TECHNOLOGIES: Record<string, Technology> = {

  /** Technologies for empire variables (market, pop, system) */

  /**
   * Market technologies, market fee is already a multiplier
   */

  /** market fee reduction */
  novice_trader: { // reduced market fee
    id: 'novice_trader',
    tags: ['economy'],
    cost: 200,
    precedes: ['advanced_trader'],
    effects: [
      {
        description: '-5% market fee',
        variable: 'empire.market.fee',
        multiplier: -0.05,
      },
    ],
  },
  advanced_trader: { // further reduced market fee
    id: 'advanced_trader',
    tags: ['economy'],
    cost: 400,
    requires: ['novice_trader'],
    precedes: ['always_gamble'],
    effects: [
      {
        description: '-10% market fee',
        variable: 'empire.market.fee',
        multiplier: -0.1,
      },
    ],
  },
  always_gamble: { // further reduced market fee
    id: 'always_gamble',
    tags: ['economy'],
    cost: 800,
    requires: ['advanced_trader'],
    precedes: ['iron_bank_of_braavos'],
    effects: [
      {
        description: '-15% market fee',
        variable: 'empire.market.fee',
        multiplier: -0.15,
      },
    ],
  },
  iron_bank_of_braavos: { // further reduced market fee
    id: 'iron_bank_of_braavos',
    tags: ['economy'],
    cost: 1600,
    requires: ['always_gamble'],
    effects: [
      {
        description: '-20% market fee',
        variable: 'empire.market.fee',
        multiplier: -0.2,
      },
    ],
  },

  /**
   * Pop technologies
   */

  /** pop food consumption / nutrition */
  nutrition_1: { // reduced pop food consumption
    id: 'nutrition_1',
    tags: ['society', 'biology'],
    cost: 200,
    precedes: ['nutrition_2'],
    effects: [
      {
        description: '-5% $food$ consumption per population',
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
        description: '-10% $food$ consumption per population',
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
        description: '-15% $food$ consumption per population',
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
        description: '-20% $food$ consumption per population',
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
        description: '-5% $credits$ per unemployed population',
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
        description: '-10% $credits$ per unemployed population',
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
        description: '-15% $credits$ per unemployed population',
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
        description: '-20% $credits$ per unemployed population',
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
        description: '-25% $energy$ cost for system claims',
        variable: 'systems.colonized.cost.energy',
        multiplier: 0.75,
      },
      {
        description: '-25% $minerals$ cost for system claims',
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
        description: '-15% $minerals$ cost for system upgrades',
        variable: 'systems.upgraded.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $alloys$ cost for system upgrades',
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
        description: '-15% $alloys$ cost for system development',
        variable: 'systems.developed.cost.alloys',
        multiplier: 0.85,
      },
      {
        description: '-15% $fuel$ cost for system development',
        variable: 'systems.developed.cost.fuel',
        multiplier: 0.85,
      },
    ],
  },

  /**
   * Technologies for buildings
   * */

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
    tags: ['engineering', 'energy'],
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
    tags: ['engineering', 'energy'],
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

  /**
   * District technologies //
   */

  /** all districts: chance for ancient military */
  timeless_warfare_1: {
    id: 'timeless_warfare_1',
    tags: ['military', 'society'],
    cost: 400,
    precedes: ['timeless_warfare_2'],
    effects: [
      {
        description: '+5% chance to discover $energy$ districts on $ancient_military$',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $mining$ districts on $ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $research_site$ on $ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_foundry$ on $ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_refinery$ on $ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.05,
      },
    ],
  },
  timeless_warfare_2: {
    id: 'timeless_warfare_2',
    tags: ['military', 'society'],
    cost: 800,
    requires: ['timeless_warfare_1'],
    precedes: ['timeless_warfare_3'],
    effects: [
      {
        description: '+10% chance to discover $energy$ districts on $ancient_military',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $mining$ districts on $ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $research_site$ on $ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_foundry$ on $ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_refinery$ on $ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.1,
      },
    ],
  },
  timeless_warfare_3: {
    id: 'timeless_warfare_3',
    tags: ['military', 'society'],
    cost: 1600,
    requires: ['timeless_warfare_2'],
    effects: [
      {
        description: '+15% chance to discover $energy$ districts on $ancient_military',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $mining$ districts on $ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $research_site$ on $ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_foundry$ on $ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_refinery$ on $ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.15,
      },
    ],
  },

  /** all districts: chance for ancient industry */
  primordial_industrial_secrets_1: {
    id: 'primordial_industrial_secrets_1',
    tags: ['production'],
    cost: 400,
    precedes: ['primordial_industrial_secrets_2'],
    effects: [
      {
        description: '+5% chance to discover $energy$ districts on $ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $mining$ districts on $ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $research_site$ on $ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_foundry$ on $ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_refinery$ on $ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.05,
      },
    ],
  },
  primordial_industrial_secrets_2: {
    id: 'primordial_industrial_secrets_2',
    tags: ['production'],
    cost: 800,
    requires: ['primordial_industrial_secrets_1'],
    effects: [
      {
        description: '+10% chance to discover $energy$ districts on $ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $mining$ districts on $ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $research_site$ on $ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_foundry$ on $ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_refinery$ on $ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.1,
      },
    ],
  },
  primordial_industrial_secrets_3: {
    id: 'primordial_industrial_secrets_3',
    tags: ['production'],
    cost: 1600,
    requires: ['primordial_industrial_secrets_2'],
    effects: [
      {
        description: '+15% chance to discover $energy$ districts on $ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $mining$ districts on $ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $research_site$ on $ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_foundry$ on $ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_refinery$ on $ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.15,
      },
    ],
  },

  /** all districts: chance for ancient technology */
  wisdom_reclamation_1: {
    id: 'wisdom_reclamation_1',
    tags: ['computing', 'engineering'],
    cost: 400,
    precedes: ['wisdom_reclamation_2'],
    effects: [
      {
        description: '+5% chance to discover $energy$ districts on $ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $mining$ districts on $ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $research_site$ on $ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_foundry$ on $ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $ancient_refinery$ on $ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.05,
      },
    ],
  },
  wisdom_reclamation_2: {
    id: 'wisdom_reclamation_2',
    tags: ['computing', 'engineering'],
    cost: 800,
    requires: ['wisdom_reclamation_1'],
    effects: [
      {
        description: '+10% chance to discover $energy$ districts on $ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $mining$ districts on $ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $research_site$ on $ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_foundry$ on $ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $ancient_refinery$ on $ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.1,
      },
    ],
  },
  wisdom_reclamation_3: {
    id: 'wisdom_reclamation_3',
    tags: ['computing', 'engineering'],
    cost: 1600,
    requires: ['wisdom_reclamation_2'],
    effects: [
      {
        description: '+15% chance to discover $energy$ districts on $ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $mining$ districts on $ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $research_site$ on $ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_foundry$ on $ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $ancient_refinery$ on $ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.15,
      },
    ],
  },

  /** energy district: reduce initial mineral cost */
  energy_district_construction_1: {
    id: 'energy_district_construction_1',
    tags: ['energy'],
    cost: 200,
    precedes: ['energy_district_construction_2'],
    effects: [
      {
        description: '-10% initial $minerals$ cost for $energy$ districts',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  energy_district_construction_2: {
    id: 'energy_district_construction_2',
    tags: ['energy'],
    cost: 400,
    requires: ['energy_district_construction_1'],
    precedes: ['energy_district_construction_3'],
    effects: [
      {
        description: '-20% initial $minerals$ cost for $energy$ districts',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  energy_district_construction_3: {
    id: 'energy_district_construction_3',
    tags: ['energy'],
    cost: 800,
    precedes: ['energy_district_construction_2'],
    effects: [
      {
        description: '-30% initial $minerals$ cost for $energy$ districts',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** energy district: reduce mineral upkeep */
  low_maintenance_power_grids_1: {
    id: 'low_maintenance_power_grids_1',
    tags: ['energy'],
    cost: 200,
    precedes: ['low_maintenance_power_grids_2'],
    effects: [
      {
        description: '-10% $minerals$ upkeep for $energy$ districts',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  low_maintenance_power_grids_2: {
    id: 'low_maintenance_power_grids_2',
    tags: ['energy'],
    cost: 400,
    requires: ['low_maintenance_power_grids_1'],
    precedes: ['low_maintenance_power_grids_3'],
    effects: [
      {
        description: '-20% $minerals$ upkeep for $energy$ districts',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.8,
      },
    ],
  },
  low_maintenance_power_grids_3: {
    id: 'low_maintenance_power_grids_3',
    tags: ['energy'],
    cost: 800,
    requires: ['low_maintenance_power_grids_2'],
    effects: [
      {
        description: '-30% $minerals$ upkeep for $energy$ district',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** energy district: increase energy production */
  energy_output_1: {
    id: 'energy_output_1',
    tags: ['energy', 'production'],
    cost: 200,
    precedes: ['energy_output_2'],
    effects: [
      {
        description: '+10% $energy$ production from $energy$ districts',
        variable: 'districts.energy.production.energy',
        multiplier: 1.1,
      },
    ],
  },
  energy_output_2: {
    id: 'energy_output_2',
    tags: ['energy', 'production'],
    cost: 400,
    requires: ['energy_output_1'],
    precedes: ['energy_output_3'],
    effects: [
      {
        description: '+20% $energy$ production from $energy$ districts',
        variable: 'districts.energy.production.energy',
        multiplier: 1.2,
      },
    ],
  },
  energy_output_3: {
    id: 'energy_output_3',
    tags: ['energy', 'production'],
    cost: 800,
    requires: ['energy_output_2'],
    effects: [
      {
        description: '+30% $energy$ production from $energy$ districts',
        variable: 'districts.energy.production.energy',
        multiplier: 1.3,
      },
    ],
  },

  /** mining district: reduce initial mineral and energy cost */
  mining_foundation_1: {
    id: 'mining_foundation_1',
    tags: ['energy', 'engineering'],
    cost: 200,
    precedes: ['mining_foundation_2'],
    effects: [
      {
        description: '-5% initial $minerals$ cost for $mining$ districts',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% initial $energy$ cost for $mining$ districts',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.95,
      },
    ],
  },
  mining_foundation_2: {
    id: 'mining_foundation_2',
    tags: ['energy', 'engineering'],
    cost: 400,
    requires: ['mining_foundation_1'],
    precedes: ['mining_foundation_3'],
    effects: [
      {
        description: '-10% initial $minerals$ cost for $mining$ districts',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $energy$ cost for $mining$ districts',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  mining_foundation_3: {
    id: 'mining_foundation_3',
    tags: ['energy', 'engineering'],
    cost: 800,
    requires: ['mining_foundation_2'],
    effects: [
      {
        description: '-15% initial $minerals$ cost for $mining$ districts',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% initial $energy$ cost for $mining$ districts',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** mining district: reduce energy upkeep */
  efficient_mining_1: {
    id: 'efficient_mining_1',
    tags: ['energy', 'production'],
    cost: 200,
    precedes: ['efficient_mining_2'],
    effects: [
      {
        description: '-10% initial $energy$ upkeep for $mining$ districts',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_mining_2: {
    id: 'efficient_mining_2',
    tags: ['energy', 'production'],
    cost: 400,
    requires: ['efficient_mining_1'],
    precedes: ['efficient_mining_3'],
    effects: [
      {
        description: '-20% initial $energy$ upkeep for $mining$ districts',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  efficient_mining_3: {
    id: 'efficient_mining_3',
    tags: ['energy', 'production'],
    cost: 800,
    requires: ['efficient_mining_2'],
    effects: [
      {
        description: '-30% initial $energy$ upkeep for $mining$ districts',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** mining district: increase mineral production */
  improved_extraction_tech_1: {
    id: 'improved_extraction_tech_1',
    tags: ['energy', 'production'],
    cost: 200,
    precedes: ['improved_extraction_tech_2'],
    effects: [
      {
        description: '+10% $minerals$ production from $mining$ districts',
        variable: 'districts.mining.production.minerals',
        multiplier: 1.1,
      },
    ],
  },
  improved_extraction_tech_2: {
    id: 'improved_extraction_tech_2',
    tags: ['energy', 'production'],
    cost: 400,
    requires: ['improved_extraction_tech_1'],
    precedes: ['improved_extraction_tech_3'],
    effects: [
      {
        description: '+20% $minerals$ production from $mining$ districts',
        variable: 'districts.mining.production.minerals',
        multiplier: 1.2,
      },
    ],
  },
  improved_extraction_tech_3: {
    id: 'improved_extraction_tech_3',
    tags: ['energy', 'production'],
    cost: 800,
    requires: ['improved_extraction_tech_2'],
    effects: [
      {
        description: '+30% $minerals$ production from $mining$ districts',
        variable: 'districts.mining.production.minerals',
        multiplier: 1.3,
      },
    ],
  },

  /** agricultural district: reduce initial energy cost */
  efficient_agriculture_1: {
    id: 'efficient_agriculture_1',
    tags: ['energy', 'biology'],
    cost: 200,
    precedes: ['efficient_agriculture_2'],
    effects: [
      {
        description: '-10% initial $energy$ cost for $agriculture$ districts',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_agriculture_2: {
    id: 'efficient_agriculture_2',
    tags: ['energy', 'biology'],
    cost: 400,
    requires: ['efficient_agriculture_1'],
    precedes: ['efficient_agriculture_3'],
    effects: [
      {
        description: '-20% initial $energy$ cost for $agriculture$ districts',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.8,
      },
    ],
  },
  efficient_agriculture_3: {
    id: 'efficient_agriculture_3',
    tags: ['energy', 'biology'],
    cost: 800,
    requires: ['efficient_agriculture_2'],
    effects: [
      {
        description: '-30% initial $energy$ cost for $agriculture$ districts',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** agricultural district: reduce energy upkeep */
  self_replenishment_1: {
    id: 'self_replenishment_1',
    tags: ['energy', 'biology'],
    cost: 200,
    precedes: ['self_replenishment_2'],
    effects: [
      {
        description: '-10% $energy$ upkeep for $agriculture$ districts',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  self_replenishment_2: {
    id: 'self_replenishment_2',
    tags: ['energy', 'biology'],
    cost: 400,
    requires: ['self_replenishment_1'],
    precedes: ['self_replenishment_3'],
    effects: [
      {
        description: '-20% $energy$ upkeep for $agriculture$ districts',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  self_replenishment_3: {
    id: 'self_replenishment_3',
    tags: ['energy', 'biology'],
    cost: 800,
    requires: ['self_replenishment_2'],
    effects: [
      {
        description: '-30% $energy$ upkeep for $agriculture$ districts',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** agricultural district: increase food production */
  superior_crops_1: {
    id: 'superior_crops_1',
    tags: ['energy', 'biology'],
    cost: 200,
    precedes: ['superior_crops_2'],
    effects: [
      {
        description: '+10% $food$ production from $agriculture$ districts',
        variable: 'districts.agriculture.production.food',
        multiplier: 1.1,
      },
    ],
  },
  superior_crops_2: {
    id: 'superior_crops_2',
    tags: ['energy', 'biology'],
    cost: 400,
    requires: ['superior_crops_1'],
    precedes: ['superior_crops_3'],
    effects: [
      {
        description: '+20% $food$ production from $agriculture$ districts',
        variable: 'districts.agriculture.production.food',
        multiplier: 1.2,
      },
    ],
  },
  superior_crops_3: {
    id: 'superior_crops_3',
    tags: ['energy', 'biology'],
    cost: 800,
    requires: ['superior_crops_2'],
    effects: [
      {
        description: '+30% $food$ production from $agriculture$ districts',
        variable: 'districts.agriculture.production.food',
        multiplier: 1.3,
      },
    ],
  },

  /** research site: reduce initial mineral cost */
  effective_lab_building_1: {
    id: 'effective_lab_building_1',
    tags: ['construction', 'engineering'],
    cost: 200,
    precedes: ['effective_lab_building_2'],
    effects: [
      {
        description: '-10% initial $minerals$ cost for $research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  effective_lab_building_2: {
    id: 'effective_lab_building_2',
    tags: ['construction', 'engineering'],
    cost: 400,
    requires: ['effective_lab_building_1'],
    precedes: ['effective_lab_building_3'],
    effects: [
      {
        description: '-20% initial $minerals$ cost for $research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  effective_lab_building_3: {
    id: 'effective_lab_building_3',
    tags: ['construction', 'engineering'],
    cost: 800,
    requires: ['effective_lab_building_2'],
    effects: [
      {
        description: '-30% initial $minerals$ cost for $research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** research site: reduce energy upkeep */
  effective_research_1: {
    id: 'effective_research_1',
    tags: ['construction', 'engineering', 'energy'],
    cost: 200,
    precedes: ['effective_research_2'],
    effects: [
      {
        description: '-10% $energy$ upkeep for $research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  effective_research_2: {
    id: 'effective_research_2',
    tags: ['construction', 'engineering', 'energy'],
    cost: 400,
    requires: ['effective_research_1'],
    precedes: ['effective_research_3'],
    effects: [
      {
        description: '-20% $energy$ upkeep for $research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  effective_research_3: {
    id: 'automated_research_archives_3',
    tags: ['construction', 'engineering', 'energy'],
    cost: 800,
    requires: ['effective_research_2'],
    effects: [
      {
        description: '-30% $energy$ upkeep for $research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** research site: increase research production */
  increased_research_production_1: {
    id: 'increased_research_production_1',
    tags: ['computing'],
    cost: 200,
    precedes: ['increased_research_production_2'],
    effects: [
      {
        description: '+10% $research$ production from $research_site$',
        variable: 'districts.research_site.production.research',
        multiplier: 1.1,
      },
    ],
  },
  increased_research_production_2: {
    id: 'increased_research_production_2',
    tags: ['computing'],
    cost: 400,
    requires: ['increased_research_production_1'],
    precedes: ['increased_research_production_3'],
    effects: [
      {
        description: '+20% $research$ production from $research_site$',
        variable: 'districts.research_site.production.research',
        multiplier: 1.2,
      },
    ],
  },
  increased_research_production_3: {
    id: 'increased_research_production_3',
    tags: ['computing'],
    cost: 800,
    requires: ['increased_research_production_2'],
    effects: [
      {
        description: '+30% $research$ production from $research_site$',
        variable: 'districts.research_site.production.research',
        multiplier: 1.3,
      },
    ],
  },

  /** ancient_foundry: reduce initial mineral cost */
  ancient_crafting_1: {
    id: 'ancient_crafting_1',
    tags: ['engineering'],
    cost: 200,
    precedes: ['ancient_crafting_2'],
    effects: [
      {
        description: '-10% initial $minerals$ cost for $ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  ancient_crafting_2: {
    id: 'ancient_crafting_2',
    tags: ['engineering'],
    cost: 400,
    requires: ['ancient_crafting_1'],
    precedes: ['ancient_crafting_3'],
    effects: [
      {
        description: '-20% initial $minerals$ cost for $ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  ancient_crafting_3: {
    id: 'ancient_crafting_3',
    tags: ['engineering'],
    cost: 800,
    requires: ['ancient_techniques_2'],
    effects: [
      {
        description: '-30% initial $minerals$ cost for $ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** ancient_foundry: reduce energy and mineral upkeep */
  timeless_fabrication_methods_1: {
    id: 'timeless_fabrication_methods_1',
    tags: ['energy', 'engineering'],
    cost: 200,
    precedes: ['timeless_fabrication_methods_2'],
    effects: [
      {
        description: '-5% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  timeless_fabrication_methods_2: {
    id: 'timeless_fabrication_methods_2',
    tags: ['energy', 'engineering'],
    cost: 400,
    requires: ['timeless_fabrication_methods_1'],
    precedes: ['timeless_fabrication_methods_3'],
    effects: [
      {
        description: '-10% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  timeless_fabrication_methods_3: {
    id: 'timeless_fabrication_methods_3',
    tags: ['energy', 'engineering'],
    cost: 800,
    requires: ['timeless_fabrication_methods_2'],
    effects: [
      {
        description: '-15% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** ancient_foundry: increase alloy production */
  mythic_alloy_crafting_1: {
    id: 'mythic_alloy_crafting_1',
    tags: ['production', 'materials'],
    cost: 200,
    precedes: ['mythic_alloy_crafting_2'],
    effects: [
      {
        description: '+10% $alloys$ production from $ancient_foundry$',
        variable: 'districts.ancient_foundry.production.alloys',
        multiplier: 1.1,
      },
    ],
  },
  mythic_alloy_crafting_2: {
    id: 'mythic_alloy_crafting_2',
    tags: ['production', 'materials'],
    cost: 400,
    requires: ['mythic_alloy_crafting_1'],
    precedes: ['mythic_alloy_crafting_3'],
    effects: [
      {
        description: '+20% $alloys$ production from $ancient_foundry$',
        variable: 'districts.ancient_foundry.production.alloys',
        multiplier: 1.2,
      },
    ],
  },
  mythic_alloy_crafting_3: {
    id: 'mythic_alloy_crafting_3',
    tags: ['production', 'materials'],
    cost: 800,
    requires: ['mythic_alloy_crafting_2'],
    effects: [
      {
        description: '+30% $alloys$ production from $ancient_foundry$',
        variable: 'districts.ancient_foundry.production.alloys',
        multiplier: 1.3,
      },
    ],
  },

  /** ancient_refinery: reduce initial mineral cost */
  traditional_refining_wisdom_1: {
    id: 'traditional_refining_wisdom_1',
    tags: ['engineering'],
    cost: 200,
    precedes: ['traditional_refining_wisdom_2'],
    effects: [
      {
        description: '-10% initial $minerals$ cost for $ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  traditional_refining_wisdom_2: {
    id: 'traditional_refining_wisdom_2',
    tags: ['engineering'],
    cost: 400,
    requires: ['traditional_refining_wisdom_1'],
    precedes: ['traditional_refining_wisdom_3'],
    effects: [
      {
        description: '-20% initial $minerals$ cost for $ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  traditional_refining_wisdom_3: {
    id: 'traditional_refining_wisdom_3',
    tags: ['engineering'],
    cost: 800,
    requires: ['traditional_refining_wisdom_2'],
    effects: [
      {
        description: '-30% initial $minerals$ cost for $ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** ancient_refinery: reduce energy and mineral upkeep */
  ageless_refining_techniques_1: {
    id: 'ageless_refining_techniques_1',
    tags: ['energy', 'engineering'],
    cost: 200,
    precedes: ['ageless_refining_techniques_2'],
    effects: [
      {
        description: '-5% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  ageless_refining_techniques_2: {
    id: 'ageless_refining_techniques_2',
    tags: ['energy', 'engineering'],
    cost: 400,
    requires: ['ageless_refining_techniques_1'],
    precedes: ['ageless_refining_techniques_3'],
    effects: [
      {
        description: '-10% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  ageless_refining_techniques_3: {
    id: 'ageless_refining_techniques_3',
    tags: ['energy', 'engineering'],
    cost: 800,
    requires: ['ageless_refining_techniques_2'],
    effects: [
      {
        description: '-15% $minerals$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $energy$ upkeep for $ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** ancient_refinery: increase fuel production */
  ancient_alchemy_1: {
    id: 'ancient_alchemy_1',
    tags: ['propulsion'],
    cost: 200,
    precedes: ['ancient_alchemy_2'],
    effects: [
      {
        description: '+10% $fuel$ production from $ancient_refinery$',
        variable: 'districts.ancient_refinery.production.fuel',
        multiplier: 1.1,
      },
    ],
  },
  ancient_alchemy_2: {
    id: 'ancient_alchemy_2',
    tags: ['propulsion'],
    cost: 400,
    requires: ['ancient_alchemy_1'],
    precedes: ['ancient_alchemy_3'],
    effects: [
      {
        description: '+20% $fuel$ production from $ancient_refinery$',
        variable: 'districts.ancient_refinery.production.fuel',
        multiplier: 1.2,
      },
    ],
  },
  ancient_alchemy_3: {
    id: 'ancient_alchemy_3',
    tags: ['propulsion'],
    cost: 800,
    requires: ['ancient_alchemy_2'],
    effects: [
      {
        description: '+30% $fuel$ production from $ancient_refinery$',
        variable: 'districts.ancient_refinery.production.fuel',
        multiplier: 1.3,
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
