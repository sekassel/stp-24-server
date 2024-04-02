import type {District} from './types';

export const DISTRICTS = {
  city: {
    id: 'city',
    chance: {},
    cost: {
      minerals: 100, // city_structure tech tree
    },
    upkeep: {
      energy: 10, // efficient_city tech tree
      consumer_goods: 5, // efficient_city tech tree
    },
    production: {
      credits: 25, // city_production tech tree
    },
  },
  // basic resource districts. cost should be around 75, upkeep around 5, production around 10
  energy: {
    id: 'energy',
    chance: {
      energy: 5,
      ancient_technology: 4, // wisdom_reclamation tech tree
      ancient_industry: 3, // primordial_industrial_secrets tech tree
      ancient_military: 3, // timeless_warfare tech tree
      default: 2,
    },
    cost: {
      minerals: 75, // quantum_cost_reduction tech tree
    },
    upkeep: { // low_maintenance_power_grids tech tree
      minerals: 1,
    },
    production: { // energetic_terraforming tech tree
      energy: 10,
    },
  },
  mining: {
    id: 'mining',
    chance: {
      mining: 5,
      ancient_industry: 4, // primordial_industrial_secrets tech tree
      ancient_technology: 3, // wisdom_reclamation tech tree
      ancient_military: 3, // timeless_warfare tech tree
      default: 2,
    },
    cost: {
      minerals: 50, // nano_excavator_optimization tech tree
      energy: 25, // nano_excavator_optimization tech tree
    },
    upkeep: { // autonomous_mining_protocols tech tree
      energy: 1,
      fuel: 1,
    },
    production: { //improved_extraction_tech_1 tech tree
      minerals: 12,
    },
  },
  agriculture: {
    id: 'agriculture',
    chance: {
      agriculture: 5,
      default: 2,
    },
    cost: {
      energy: 75, // permaculture_ecosystem_engineering tech tree
    },
    upkeep: {
      energy: 1, // self_replenishment tech tree
      fuel: 1,
    },
    production: {
      food: 12, // superior_crops tech tree
    },
  },
  // advanced resource districts. cost should be around 100, upkeep around 20, production around 10
  industry: {
    id: 'industry',
    chance: {},
    cost: {
      minerals: 100,
    },
    upkeep: {
      energy: 10,
      minerals: 10,
    },
    production: {
      alloys: 5,
      consumer_goods: 5,
      fuel: 5,
    },
  },
  research_site: {
    id: 'research_site',
    chance: {
      ancient_technology: 5, // wisdom_reclamation tech tree
      ancient_military: 2, // timeless_warfare tech tree
      ancient_industry: 2, // primordial_industrial_secrets tech tree
      default: 0,
    },
    cost: {
      minerals: 100, // effective_lab_building tech tree
    },
    upkeep: {
      energy: 15, // automated_research_archives tech tree
      consumer_goods: 5,
    },
    production: {
      research: 10, // research_accelerators tech tree
    },
  },
  ancient_foundry: {
    id: 'ancient_foundry',
    chance: {
      ancient_military: 5, // timeless_warfare tech tree
      ancient_industry: 3, // primordial_industrial_secrets tech tree
      ancient_technology: 2, // wisdom_reclamation tech tree
      default: 0,
    },
    cost: {
      minerals: 100, // ancient_crafting_techniques tech tree
    },
    upkeep: {
      minerals: 10, // timeless_fabrication_methods tech tree
      energy: 5, // timeless_fabrication_methods tech tree
    },
    production: {
      alloys: 10, // mythic_alloy_crafting tech tree
    },
  },
  ancient_factory: {
    id: 'ancient_factory',
    chance: {
      ancient_industry: 5,
      ancient_technology: 3,
      ancient_military: 2,
      default: 0,
    },
    cost: {
      minerals: 100,
    },
    upkeep: {
      energy: 5,
      minerals: 10,
    },
    production: {
      consumer_goods: 10,
    },
  },
  ancient_refinery: {
    id: 'ancient_refinery',
    chance: {
      ancient_industry: 5, // primordial_industrial_secrets tech tree
      ancient_military: 3, // timeless_warfare tech tree
      ancient_technology: 2, // wisdom_reclamation tech tree
      default: 0,
    },
    cost: {
      minerals: 100, // traditional_refining_wisdom tech tree
    },
    upkeep: {
      minerals: 5, // ageless_refining_techniques tech tree
      energy: 10, // ageless_refining_techniques tech tree
    },
    production: {
      fuel: 10, // ancient_alchemy tech tree
    },
  },
} as const satisfies Record<string, District>;
export type DistrictName = keyof typeof DISTRICTS;
export const DISTRICT_NAMES = Object.keys(DISTRICTS) as DistrictName[];
