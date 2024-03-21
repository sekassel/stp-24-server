import {Technology, TECHNOLOGY_TAGS, TechnologyTag, Variable} from './types';

export const TECH_CATEGORIES = Object.fromEntries(TECHNOLOGY_TAGS.map(tag => [tag, {
  cost_multiplier: 1,
}])) as Record<TechnologyTag, {
  cost_multiplier: number;
}>;

export const TECHNOLOGIES: Record<string, Technology> = {

  /** Technologies for empire variables (market, pop, system) */

  /** society: unlock technologies*/
  society: {
    id: 'society',
    tags: ['society'],
    cost: 200,
    effects: [
    ],
  },
  demographic: {
    id: 'demographic',
    tags: ['society'],
    cost: 100,
    requires: ['society'],
    effects: [
    ],
  },
  physics: {
    id: 'physics',
    tags: ['physics'],
    cost: 200,
    effects: [
    ],
  },
  technology: {
    id: 'technology',
    tags: ['physics'],
    cost: 100,
    requires: ['physics'],
    effects: [
    ],
  },
  engineering: {
    id: 'engineering',
    tags: ['engineering'],
    cost: 200,
    effects: [
    ],
  },
  construction: {
    id: 'construction',
    tags: ['engineering', 'construction'],
    cost: 100,
    requires: ['engineering'],
    effects: [
    ],
  },
  production: {
    id: 'production',
    tags: ['engineering', 'production'],
    cost: 100,
    requires: ['engineering'],
    effects: [
    ],
  },

  /**
   * Market technologies, market fee is already a multiplier
   */

  /** market fee reduction */
  novice_trader: { // reduced market fee
    id: 'novice_trader',
    tags: ['society', 'economy'],
    cost: 200,
    requires: ['society'],
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
    tags: ['society', 'economy'],
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
    tags: ['society', 'economy'],
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
    tags: ['society', 'economy'],
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
   * System technologies
   */

  /** system claims: colonizing, upgrading and developing systems */
  cheap_claims_1: { // reduced system claim costs
    id: 'cheap_claims_1',
    tags: ['society', 'state'],
    cost: 200,
    requires: ['society'],
    effects: [
      {
        description: '-25% $resources.energy$ cost for $systems.colonized$',
        variable: 'systems.colonized.cost.energy',
        multiplier: 0.75,
      },
      {
        description: '-25% $resources.minerals$ cost for $systems.colonized$',
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
        description: '-15% $resources.minerals$ cost for $systems.upgraded$',
        variable: 'systems.upgraded.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.alloys$ cost for $systems.upgraded$',
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
        description: '-15% $resources.alloys$ cost for $systems.developed$',
        variable: 'systems.developed.cost.alloys',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.fuel$ cost for $systems.developed$',
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
    requires: ['construction'],
    precedes: ['cheap_buildings_2'],
    effects: [
      {
        description: '-15% $resources.minerals$ cost for $buildings.power_plant$',
        variable: 'buildings.power_plant.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.minerals$ cost for $buildings.mine$',
        variable: 'buildings.mine.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ cost for $buildings.mine$',
        variable: 'buildings.mine.cost.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ cost for $buildings.farm$',
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
        description: '-15% $resources.minerals$ cost for $buildings.research_lab$',
        variable: 'buildings.research_lab.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.minerals$ cost for $buildings.foundry$',
        variable: 'buildings.foundry.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.minerals$ cost for $buildings.refinery$',
        variable: 'buildings.refinery.cost.minerals',
        multiplier: 0.85,
      },
    ],
  },

  /** buildings: reduce energy upkeep */
  efficient_buildings_1: { // reduced basic building energy upkeep
    id: 'efficient_buildings_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['technology'],
    precedes: ['efficient_buildings_2'],
    effects: [
      {
        description: '-15% $resources.energy$ upkeep for $buildings.mine$',
        variable: 'buildings.mine.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ upkeep for $buildings.farm$',
        variable: 'buildings.farm.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },
  efficient_buildings_2: { // reduced advanced building energy upkeep
    id: 'efficient_buildings_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['efficient_buildings_1'],
    effects: [
      {
        description: '-15% $resources.energy$ upkeep for $buildings.research_lab$',
        variable: 'buildings.research_lab.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ upkeep for $buildings.foundry$',
        variable: 'buildings.foundry.upkeep.energy',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ upkeep for $buildings.refinery$',
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
    requires: ['production'],
    precedes: ['improved_production_2'],
    effects: [
      {
        description: '+5% $resources.energy$ production from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.05,
      },
      {
        description: '+5% $resources.minerals$ production from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.05,
      },
      {
        description: '+5% $resources.food$ production from $buildings.farm$',
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
        description: '+10% $resources.energy$ production from $buildings.power_plant$',
        variable: 'buildings.power_plant.production.energy',
        multiplier: 1.1,
      },
      {
        description: '+10% $resources.minerals$ production from $buildings.mine$',
        variable: 'buildings.mine.production.minerals',
        multiplier: 1.1,
      },
      {
        description: '+10% $resources.food$ production from $buildings.farm$',
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
        description: '+5% $resources.research$ production from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.05,
      },
      {
        description: '+5% $resources.alloys$ production from $buildings.foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.05,
      },
      {
        description: '+5% $resources.fuel$ production from $buildings.refinery$',
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
        description: '+10% $resources.research$ production from $buildings.research_lab$',
        variable: 'buildings.research_lab.production.research',
        multiplier: 1.1,
      },
      {
        description: '+10% $resources.alloys$ production from $buildings.foundry$',
        variable: 'buildings.foundry.production.alloys',
        multiplier: 1.1,
      },
      {
        description: '+10% $resources.fuel$ production from $buildings.refinery$',
        variable: 'buildings.refinery.production.fuel',
        multiplier: 1.1,
      },
    ],
  },

  /** buildings: reduce mineral upkeep */
  efficient_resources_1: { // reduced basic building upkeep
    id: 'efficient_resources_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['construction'],
    precedes: ['efficient_resources_2'],
    effects: [
      {
        description: '-10% $resources.minerals$ upkeep for $buildings.power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $resources.minerals$ upkeep for $buildings.foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $resources.minerals$ upkeep for $buildings.refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  efficient_resources_2: { // further reduced basic building upkeep
    id: 'efficient_resources_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['efficient_resources_1'],
    effects: [
      {
        description: '-15% $resources.minerals$ upkeep for $buildings.power_plant$',
        variable: 'buildings.power_plant.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.minerals$ upkeep for $buildings.foundry$',
        variable: 'buildings.foundry.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.minerals$ upkeep for $buildings.refinery$',
        variable: 'buildings.refinery.upkeep.minerals',
        multiplier: 0.85,
      },
    ],
  },

  /**
   * District technologies //
   */

  /** all districts: unlock district specialization */
  district_specialization: {
    id: 'district_specialization',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['engineering', 'technology'],
    effects: [
    ],
  },
  district_production_increase: {
    id: 'district_production_increase',
    tags: ['engineering', 'construction'],
    cost: 100,
    requires: ['district_specialization'],
    effects: [
    ],
  },
  ancient_district_production_increase: {
    id: 'ancient_district_production_increase',
    tags: ['engineering', 'construction'],
    cost: 100,
    requires: ['district_production_increase'],
    effects: [
    ],
  },
  district_cost_reduction: {
    id: 'district_cost_reduction',
    tags: ['engineering', 'construction'],
    cost: 100,
    requires: ['district_specialization'],
    effects: [
    ],
  },
  ancient_district_cost_reduction: {
    id: 'ancient_district_cost_reduction',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['district_cost_reduction'],
    effects: [
    ],
  },
  district_upkeep_reduction: {
    id: 'district_upkeep_reduction',
    tags: ['engineering', 'construction'],
    cost: 100,
    requires: ['district_specialization'],
    effects: [
    ],
  },
  ancient_district_upkeep_reduction: {
    id: 'ancient_district_upkeep_reduction',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['district_upkeep_reduction'],
    effects: [
    ],
  },

  /** all districts: activate ancient military, industry and technology */
  ancient_mastery: {
    id: 'ancient_mastery',
    tags: ['engineering', 'construction', 'rare'],
    cost: 200,
    requires: ['district_specialization'],
    effects: [
    ],
  },

  /** all districts: chance for ancient military */
  ancient_military_activation: {
    id: 'ancient_military_activation',
    tags: ['society', 'military', 'rare'],
    cost: 200,
    requires: ['ancient_mastery'],
    precedes: ['ancient_military_1'],
    effects: [
    ],
  },
  ancient_military_1: {
    id: 'ancient_military_1',
    tags: ['society', 'military', 'rare'],
    cost: 400,
    requires: ['ancient_military_activation'],
    precedes: ['ancient_military_2'],
    effects: [
      {
        description: '+5% chance to discover $districts.energy$ on $systems.ancient_military$',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.mining$ on $systems.ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.research_site$ on $systems.ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_foundry$ on $systems.ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_refinery$ on $systems.ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.05,
      },
    ],
  },
  ancient_military_2: {
    id: 'ancient_military_2',
    tags: ['society', 'military', 'rare'],
    cost: 800,
    requires: ['ancient_military_1'],
    precedes: ['ancient_military_3'],
    effects: [
      {
        description: '+10% chance to discover $districts.energy$ on $ancient_military',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.mining$ on $systems.ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.research_site$ on $systems.ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_foundry$ on $systems.ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_refinery$ on $systems.ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.1,
      },
    ],
  },
  ancient_military_3: {
    id: 'ancient_military_3',
    tags: ['society', 'military', 'rare'],
    cost: 1600,
    requires: ['ancient_military_2'],
    effects: [
      {
        description: '+15% chance to discover $districts.energy$ on $ancient_military',
        variable: 'districts.energy.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.mining$ on $systems.ancient_military$',
        variable: 'districts.mining.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.research_site$ on $systems.ancient_military$',
        variable: 'districts.research_site.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_foundry$ on $systems.ancient_military$',
        variable: 'districts.ancient_foundry.chance.ancient_military',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_refinery$ on $systems.ancient_military$',
        variable: 'districts.ancient_refinery.chance.ancient_military',
        multiplier: 1.15,
      },
    ],
  },

  /** all districts: chance for ancient industry */
  ancient_industry_activation: {
    id: 'ancient_industry_activation',
    tags: ['engineering', 'production', 'rare'],
    cost: 200,
    requires: ['ancient_mastery'],
    precedes: ['ancient_industry_1'],
    effects: [
    ],
  },
  ancient_industry_1: {
    id: 'ancient_industry_1',
    tags: ['engineering', 'production', 'rare'],
    cost: 400,
    requires: ['ancient_industry_activation'],
    precedes: ['ancient_industry_2'],
    effects: [
      {
        description: '+5% chance to discover $districts.energy$ on $systems.ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.mining$ on $systems.ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.research_site$ on $systems.ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_foundry$ on $systems.ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_refinery$ on $systems.ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.05,
      },
    ],
  },
  ancient_industry_2: {
    id: 'ancient_industry_2',
    tags: ['engineering', 'production', 'rare'],
    cost: 800,
    requires: ['ancient_industry_1'],
    precedes: ['ancient_industry_3'],
    effects: [
      {
        description: '+10% chance to discover $districts.energy$ on $systems.ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.mining$ on $systems.ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.research_site$ on $systems.ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_foundry$ on $systems.ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_refinery$ on $systems.ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.1,
      },
    ],
  },
  ancient_industry_3: {
    id: 'ancient_industry_3',
    tags: ['engineering', 'production', 'rare'],
    cost: 1600,
    requires: ['ancient_industry_2'],
    effects: [
      {
        description: '+15% chance to discover $districts.energy$ on $systems.ancient_industry$',
        variable: 'districts.energy.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.mining$ on $systems.ancient_industry$',
        variable: 'districts.mining.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.research_site$ on $systems.ancient_industry$',
        variable: 'districts.research_site.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_foundry$ on $systems.ancient_industry$',
        variable: 'districts.ancient_foundry.chance.ancient_industry',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_refinery$ on $systems.ancient_industry$',
        variable: 'districts.ancient_refinery.chance.ancient_industry',
        multiplier: 1.15,
      },
    ],
  },

  /** all districts: chance for ancient technology */
  ancient_tech_activation: {
    id: 'ancient_tech_activation',
    tags: ['physics', 'computing', 'rare'],
    cost: 200,
    requires: ['ancient_mastery'],
    precedes: ['ancient_tech_1'],
    effects: [
    ],
  },
  ancient_tech_1: {
    id: 'ancient_tech_1',
    tags: ['physics', 'computing', 'rare'],
    cost: 400,
    requires: ['ancient_tech_activation'],
    precedes: ['ancient_tech_2'],
    effects: [
      {
        description: '+5% chance to discover $districts.energy$ on $systems.ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.mining$ on $systems.ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.research_site$ on $systems.ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_foundry$ on $systems.ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.05,
      },
      {
        description: '+5% chance to discover $districts.ancient_refinery$ on $systems.ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.05,
      },
    ],
  },
  ancient_tech_2: {
    id: 'ancient_tech_2',
    tags: ['physics', 'computing', 'rare'],
    cost: 800,
    requires: ['ancient_tech_1'],
    precedes: ['ancient_tech_3'],
    effects: [
      {
        description: '+10% chance to discover $districts.energy$ on $systems.ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.mining$ on $systems.ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.research_site$ on $systems.ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_foundry$ on $systems.ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.1,
      },
      {
        description: '+10% chance to discover $districts.ancient_refinery$ on $systems.ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.1,
      },
    ],
  },
  ancient_tech_3: {
    id: 'ancient_tech_3',
    tags: ['physics', 'computing', 'rare'],
    cost: 1600,
    requires: ['ancient_tech_2'],
    effects: [
      {
        description: '+15% chance to discover $districts.energy$ on $systems.ancient_technology$',
        variable: 'districts.energy.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.mining$ on $systems.ancient_technology$',
        variable: 'districts.mining.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.research_site$ on $systems.ancient_technology$',
        variable: 'districts.research_site.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_foundry$ on $systems.ancient_technology$',
        variable: 'districts.ancient_foundry.chance.ancient_technology',
        multiplier: 1.15,
      },
      {
        description: '+15% chance to discover $districts.ancient_refinery$ on $systems.ancient_technology$',
        variable: 'districts.ancient_refinery.chance.ancient_technology',
        multiplier: 1.15,
      },
    ],
  },

  /** energy district: reduce initial mineral cost */
  energy_district_construction_1: {
    id: 'energy_district_construction_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['district_cost_reduction'],
    precedes: ['energy_district_construction_2'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ cost for $districts.energy$',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  energy_district_construction_2: {
    id: 'energy_district_construction_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['energy_district_construction_1'],
    precedes: ['energy_district_construction_3'],
    effects: [
      {
        description: '-20% initial $resources.minerals$ cost for $districts.energy$',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  energy_district_construction_3: {
    id: 'energy_district_construction_3',
    tags: ['engineering', 'construction'],
    cost: 800,
    requires: ['energy_district_construction_2'],
    effects: [
      {
        description: '-30% initial $resources.minerals$ cost for $districts.energy$',
        variable: 'districts.energy.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** energy district: reduce mineral upkeep */
  efficient_energy_1: {
    id: 'efficient_energy_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['district_upkeep_reduction'],
    precedes: ['efficient_energy_2'],
    effects: [
      {
        description: '-10% $resources.minerals$ upkeep for $districts.energy$',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.9,
      },
    ],
  },
  efficient_energy_2: {
    id: 'efficient_energy_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['efficient_energy_1'],
    precedes: ['efficient_energy_3'],
    effects: [
      {
        description: '-20% $resources.minerals$ upkeep for $districts.energy$',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.8,
      },
    ],
  },
  efficient_energy_3: {
    id: 'efficient_energy_3',
    tags: ['engineering', 'construction'],
    cost: 800,
    requires: ['efficient_energy_2'],
    effects: [
      {
        description: '-30% $resources.minerals$ upkeep for $districts.energy$',
        variable: 'districts.energy.upkeep.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** mining district: reduce initial mineral and energy cost */
  mining_foundation_1: {
    id: 'mining_foundation_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['district_cost_reduction'],
    precedes: ['mining_foundation_2'],
    effects: [
      {
        description: '-5% initial $resources.minerals$ cost for $districts.mining$',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% initial $resources.energy$ cost for $districts.mining$',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.95,
      },
    ],
  },
  mining_foundation_2: {
    id: 'mining_foundation_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['mining_foundation_1'],
    precedes: ['mining_foundation_3'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ cost for $districts.mining$',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% initial $resources.energy$ cost for $districts.mining$',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  mining_foundation_3: {
    id: 'mining_foundation_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['mining_foundation_2'],
    effects: [
      {
        description: '-15% initial $resources.minerals$ cost for $districts.mining$',
        variable: 'districts.mining.cost.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% initial $resources.energy$ cost for $districts.mining$',
        variable: 'districts.mining.cost.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** mining district: reduce energy upkeep */
  efficient_mining_1: {
    id: 'efficient_mining_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['district_upkeep_reduction'],
    precedes: ['efficient_mining_2'],
    effects: [
      {
        description: '-10% initial $resources.energy$ upkeep for $districts.mining$',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_mining_2: {
    id: 'efficient_mining_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['efficient_mining_1'],
    precedes: ['efficient_mining_3'],
    effects: [
      {
        description: '-20% initial $resources.energy$ upkeep for $districts.mining$',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  efficient_mining_3: {
    id: 'efficient_mining_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['efficient_mining_2'],
    effects: [
      {
        description: '-30% initial $resources.energy$ upkeep for $districts.mining$',
        variable: 'districts.mining.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** agricultural district: reduce initial energy cost */
  agriculture_cost_reduction_1: {
    id: 'agriculture_cost_reduction_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['district_cost_reduction'],
    precedes: ['agriculture_cost_reduction_2'],
    effects: [
      {
        description: '-10% initial $resources.energy$ cost for $districts.agriculture$',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.9,
      },
    ],
  },
  agriculture_cost_reduction_2: {
    id: 'agriculture_cost_reduction_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['agriculture_cost_reduction_1'],
    precedes: ['agriculture_cost_reduction_3'],
    effects: [
      {
        description: '-20% initial $resources.energy$ cost for $districts.agriculture$',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.8,
      },
    ],
  },
  agriculture_cost_reduction_3: {
    id: 'agriculture_cost_reduction_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['agriculture_cost_reduction_2'],
    effects: [
      {
        description: '-30% initial $resources.energy$ cost for $districts.agriculture$',
        variable: 'districts.agriculture.cost.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** agricultural district: reduce energy upkeep */
  efficient_agriculture_1: {
    id: 'efficient_agriculture_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['district_upkeep_reduction'],
    precedes: ['efficient_agriculture_2'],
    effects: [
      {
        description: '-10% $resources.energy$ upkeep for $districts.agriculture$',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_agriculture_2: {
    id: 'efficient_agriculture_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['efficient_agriculture_1'],
    precedes: ['efficient_agriculture_3'],
    effects: [
      {
        description: '-20% $resources.energy$ upkeep for $districts.agriculture$',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  efficient_agriculture_3: {
    id: 'efficient_agriculture_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['efficient_agriculture_2'],
    effects: [
      {
        description: '-30% $resources.energy$ upkeep for $districts.agriculture$',
        variable: 'districts.agriculture.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** research site: reduce initial mineral cost */
  effective_lab_building_1: {
    id: 'effective_lab_building_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['district_cost_reduction'],
    precedes: ['effective_lab_building_2'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ cost for $districts.research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  effective_lab_building_2: {
    id: 'effective_lab_building_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['effective_lab_building_1'],
    precedes: ['effective_lab_building_3'],
    effects: [
      {
        description: '-20% initial $resources.minerals$ cost for $districts.research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  effective_lab_building_3: {
    id: 'effective_lab_building_3',
    tags: ['engineering', 'construction'],
    cost: 800,
    requires: ['effective_lab_building_2'],
    effects: [
      {
        description: '-30% initial $resources.minerals$ cost for $districts.research_site$',
        variable: 'districts.research_site.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** research site: reduce energy upkeep */
  effective_research_1: {
    id: 'effective_research_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['district_upkeep_reduction'],
    precedes: ['effective_research_2'],
    effects: [
      {
        description: '-10% $resources.energy$ upkeep for $districts.research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  effective_research_2: {
    id: 'effective_research_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['effective_research_1'],
    precedes: ['effective_research_3'],
    effects: [
      {
        description: '-20% $resources.energy$ upkeep for $districts.research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.8,
      },
    ],
  },
  effective_research_3: {
    id: 'effective_research_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['effective_research_2'],
    effects: [
      {
        description: '-30% $resources.energy$ upkeep for $districts.research_site$',
        variable: 'districts.research_site.upkeep.energy',
        multiplier: 0.7,
      },
    ],
  },

  /** ancient_foundry: reduce initial mineral cost */
  ancient_foundry_structure_1: {
    id: 'ancient_foundry_structure_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['ancient_district_cost_reduction'],
    precedes: ['ancient_foundry_structure_2'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ cost for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  ancient_foundry_structure_2: {
    id: 'ancient_foundry_structure_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['ancient_foundry_structure_1'],
    precedes: ['ancient_foundry_structure_3'],
    effects: [
      {
        description: '-20% initial $resources.minerals$ cost for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  ancient_foundry_structure_3: {
    id: 'ancient_foundry_structure_3',
    tags: ['engineering', 'construction'],
    cost: 800,
    requires: ['ancient_foundry_structure_2'],
    effects: [
      {
        description: '-30% initial $resources.minerals$ cost for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** ancient_foundry: reduce energy and mineral upkeep */
  efficient_ancient_foundry_1: {
    id: 'efficient_ancient_foundry_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['ancient_district_upkeep_reduction'],
    precedes: ['efficient_ancient_foundry_2'],
    effects: [
      {
        description: '-5% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  efficient_ancient_foundry_2: {
    id: 'efficient_ancient_foundry_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['efficient_ancient_foundry_1'],
    precedes: ['efficient_ancient_foundry_3'],
    effects: [
      {
        description: '-10% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_ancient_foundry_3: {
    id: 'efficient_ancient_foundry_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['efficient_ancient_foundry_2'],
    effects: [
      {
        description: '-15% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_foundry.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },

  /** ancient_refinery: reduce initial mineral cost */
  ancient_refinery_structure_1: {
    id: 'ancient_refinery_structure_1',
    tags: ['engineering', 'construction'],
    cost: 200,
    requires: ['ancient_district_cost_reduction'],
    precedes: ['ancient_refinery_structure_2'],
    effects: [
      {
        description: '-10% initial $resources.minerals$ cost for $districts.ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.9,
      },
    ],
  },
  ancient_refinery_structure_2: {
    id: 'ancient_refinery_structure_2',
    tags: ['engineering', 'construction'],
    cost: 400,
    requires: ['ancient_refinery_structure_1'],
    precedes: ['ancient_refinery_structure_3'],
    effects: [
      {
        description: '-20% initial $resources.minerals$ cost for $districts.ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.8,
      },
    ],
  },
  ancient_refinery_structure_3: {
    id: 'ancient_refinery_structure_3',
    tags: ['engineering', 'construction'],
    cost: 800,
    requires: ['ancient_refinery_structure_2'],
    effects: [
      {
        description: '-30% initial $resources.minerals$ cost for $districts.ancient_refinery$',
        variable: 'districts.ancient_refinery.cost.minerals',
        multiplier: 0.7,
      },
    ],
  },

  /** ancient_refinery: reduce energy and mineral upkeep */
  efficient_ancient_refinery_1: {
    id: 'efficient_ancient_refinery_1',
    tags: ['physics', 'energy'],
    cost: 200,
    requires: ['ancient_district_upkeep_reduction'],
    precedes: ['efficient_ancient_refinery_2'],
    effects: [
      {
        description: '-5% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.95,
      },
      {
        description: '-5% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.95,
      },
    ],
  },
  efficient_ancient_refinery_2: {
    id: 'efficient_ancient_refinery_2',
    tags: ['physics', 'energy'],
    cost: 400,
    requires: ['efficient_ancient_refinery_1'],
    precedes: ['efficient_ancient_refinery_3'],
    effects: [
      {
        description: '-10% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.9,
      },
      {
        description: '-10% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.9,
      },
    ],
  },
  efficient_ancient_refinery_3: {
    id: 'efficient_ancient_refinery_3',
    tags: ['physics', 'energy'],
    cost: 800,
    requires: ['efficient_ancient_refinery_2'],
    effects: [
      {
        description: '-15% $resources.minerals$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.minerals',
        multiplier: 0.85,
      },
      {
        description: '-15% $resources.energy$ upkeep for $districts.ancient_foundry$',
        variable: 'districts.ancient_refinery.upkeep.energy',
        multiplier: 0.85,
      },
    ],
  },
};

// special resources
generate_sequence('pop_food_consumption', ['society', 'biology'], 'empire.pop.consumption.food',
  '$resources.food$ per $resources.population$ per $period$', {multiplierIncrement: -0.05},
  ['demographic']);
// pop growth is already a multiplier, so it will be 1.05 -> 1.05 * 1.025 = 1.07625 -> 1.05 * 1.025^2 = 1.10390625
generate_sequence('pop_growth_colonized', ['society', 'biology'], 'systems.colonized.pop_growth',
  '$resources.population$ growth per $period$ on $systems.colonized$',
  {multiplierIncrement: +0.025}, ['demographic']);
generate_sequence('pop_growth_upgraded', ['society', 'biology'], 'systems.upgraded.pop_growth',
  '$resources.population$ growth per $period$ on $systems.upgraded$',
  {multiplierIncrement: +0.025}, ['demographic']);
generate_sequence('unemployed_pop_cost', ['society', 'state'],
  'empire.pop.consumption.credits.unemployed', '$resources.credits$ per unemployed $resources.population$ per $period$',
  {
  multiplierIncrement: -0.05,
  exponentialBase: 3,
}, ['demographic']); // -5% -> -15% -> -45%
// basic resources
generate_sequence('energy_production', ['physics', 'energy'],
  'buildings.power_plant.production.energy', '$resources.energy$ from $buildings.power_plant$ per $period$',
  {}, ['technology']);
generate_sequence('mineral_production', ['engineering', 'production'],
  'buildings.mine.production.minerals', '$resources.minerals$ from $buildings.mine$ per $period$',
  {}, ['production']);
generate_sequence('food_production', ['society', 'biology'],
  'buildings.farm.production.food', '$resources.food$ from $buildings.farm$ per $period$',
  {}, ['demographic']);
// advanced resources
generate_sequence('research_production', ['physics', 'computing'],
  'buildings.research_lab.production.research', '$resources.research$ from $buildings.research_lab$ per $period$',
  {}, ['technology']);
generate_sequence('alloy_production', ['engineering', 'materials'],
  'buildings.foundry.production.alloys', '$resources.alloys$ from $buildings.foundry$ per $period$',
  {}, ['production']);
generate_sequence('fuel_production', ['engineering', 'production'],
  'buildings.refinery.production.fuel', '$resources.fuel$ from $buildings.refinery$ per $period$',
  {}, ['production']);

// basic district resource production
generate_sequence('energy_district_production', ['physics', 'energy'],
  'districts.energy.production.energy', '$resources.energy$ from $districts.energy$ per $period$',
  {}, ['district_production_increase']);
generate_sequence('mining_district_production', ['engineering', 'production'],
  'districts.mining.production.minerals', '$resources.minerals$ from $districts.mining$ per $period$',
  {}, ['district_production_increase']);
generate_sequence('agriculture_district_production', ['society', 'biology'],
  'districts.agriculture.production.food', '$resources.food$ from $districts.agriculture$ per $period$',
  {}, ['district_production_increase']);
// advanced district resource production
generate_sequence('research_site_production', ['physics', 'computing'],
  'districts.research_site.production.research', '$resources.research$ from $districts.research_site$ per $period$',
  {}, ['district_production_increase']);
generate_sequence('ancient_foundry_production', ['engineering', 'materials'],
  'districts.ancient_foundry.production.alloys', '$resources.alloys$ from $districts.ancient_foundry$ per $period$',
  {}, ['ancient_district_production_increase']);
generate_sequence('ancient_refinery_production', ['physics', 'propulsion'],
  'districts.ancient_refinery.production.fuel', '$resources.fuel$ from $districts.ancient_refinery$ per $period$',
  {}, ['ancient_district_production_increase']);


/**
 * Generates a sequence of technologies with increasing cost and effect.
 * @example
 * generate_sequence('energy_production', 'power_plant.production.energy', '$resources.energy$ from $buildings.power_plant$ per $period$');
 * // generates:
 * TECHNOLOGIES.energy_production_1 = {
 *   id: 'energy_production_1',
 *   cost: 100,
 *   precedes: ['energy_production_2'],
 *   effects: +5% $resources.energy$ from $buildings.power_plant$ per $period$',
 * },
 * TECHNOLOGIES.energy_production_2 = {
 *   id: 'energy_production_2',
 *   cost: 200,
 *   requires: ['energy_production_1'],
 *   precedes: ['energy_production_3'],
 *   effects: +10% $resources.energy$ from $buildings.power_plant$ per $period$',
 * },
 * TECHNOLOGIES.energy_production_3 = {
 *   id: 'energy_production_3',
 *   cost: 400,
 *   requires: ['energy_production_2'],
 *   effects: +20% $resources.energy$ from $buildings.power_plant$ per $period$',
 * }
 * @example
 * generate_sequence('unemployed_pop_cost', 'pop.consumption.credits.unemployed', '$resources.credits$ per unemployed $resources.population$ per $period$', {
 *   multiplierIncrement: -0.05,
 *   exponentialBase: 3,
 * });
 * // generates:
 * TECHNOLOGIES.unemployed_pop_cost_1 = {
 *   id: 'unemployed_pop_cost_1',
 *   cost: 100,
 *   precedes: ['unemployed_pop_cost_2'],
 *   effects: -5% $resources.credits$ per unemployed $resources.population$ per $period$',
 * },
 * TECHNOLOGIES.unemployed_pop_cost_2 = {
 *   id: 'unemployed_pop_cost_2',
 *   cost: 300, // here the cost is 3x the previous cost, because exponentialBase is 3
 *   requires: ['unemployed_pop_cost_1'],
 *   precedes: ['unemployed_pop_cost_3'],
 *   effects: -15% $resources.credits$ per unemployed $resources.population$ per $period$', // 3x the previous effect
 * },
 * TECHNOLOGIES.unemployed_pop_cost_3 = {
 *   id: 'unemployed_pop_cost_3',
 *   cost: 900, // again 3x the previous cost
 *   requires: ['unemployed_pop_cost_2'],
 *   effects: -45% $resources.credits$ per unemployed $resources.population$ per $period$',
 * }
 *
 * @param base_id the base ID, e.g. "energy_production"
 * @param tags
 * @param variable the variable to modify, e.g. "power_plant.production.energy"
 * @param variable_desc the description of the variable, e.g. "$resources.energy$ from $buildings.power_plant$ per $period$"
 * @param requirement the requirement for the first step, default undefined
 * @param multiplierIncrement the amount to increase the multiplier by each step, default +0.05
 * @param exponentialBase the base of the exponential, default 2
 * @param count the number of steps, default 3
 * @param startCost the cost of the first step, default 100
 */
function generate_sequence(base_id: string, tags: TechnologyTag[], variable: Variable, variable_desc: string,
                           {multiplierIncrement = +0.05, exponentialBase = 2, count = 3, startCost = 100} = {},
                           requirement?: readonly string[],
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
      requires: requirement && index == 1 ? requirement : (index > 1 ? [base_id + '_' + (index - 1)] : undefined),
      precedes: index < count ? [base_id + '_' + (index + 1)] : undefined,
      effects: [
        {
          description: `${multiplier > 1 ? '+' : ''}${((multiplier - 1) * 100).toFixed(1)}% ${variable_desc}`,
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
