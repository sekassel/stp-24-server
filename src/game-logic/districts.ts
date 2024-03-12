import type {District} from './types';

// TODO adjust cost, upkeep, and production values
export const DISTRICTS = {
  // basic resource districts. cost should be around 75, upkeep around 5, production around 10
  energy: {
    id: 'energy',
    chance: {
      energy: 5,
      ancient_technology: 3,
      ancient_industry: 2,
      ancient_military: 2,
      default: 1,
    },
    cost: {
      minerals: 75, // quantum_cost_reduction tech tree
    },
    upkeep: { // low_maintenance_power_grids tech tree
      minerals: 5,
    },
    production: { // energetic_terraforming tech tree
      energy: 10,
    },
  },
  mining: {
    id: 'mining',
    chance: {
      mining: 5,
      ancient_industry: 3,
      ancient_technology: 2,
      ancient_military: 2,
      default: 1,
    },
    cost: {
      minerals: 50, // nano_excavator_optimization tech tree
      energy: 25, // nano_excavator_optimization tech tree
    },
    upkeep: { // autonomous_mining_protocols tech tree
      energy: 5,
    },
    production: {
      minerals: 10,
    },
  },
  agriculture: {
    id: 'agriculture',
    chance: {
      agriculture: 5,
      default: 1,
    },
    cost: {
      energy: 75, // permaculture_ecosystem_engineering tech tree
    },
    upkeep: {
      energy: 5, // self_replenishment tech tree
    },
    production: {
      food: 10, // TODO food_production tech tree
    },
  },
  // advanced resource districts. cost should be around 100, upkeep around 20, production around 10
  research_site: {
    id: 'research_site',
    chance: {
      ancient_technology: 5,
      ancient_military: 2,
      ancient_industry: 2,
      default: 1,
    },
    cost: {
      minerals: 100, // effective_lab_building tech tree
    },
    upkeep: {
      energy: 20, // automated_research_archives tech tree
    },
    production: {
      research: 10, // TODO research_production tech tree
    },
  },
  ancient_foundry: {
    id: 'ancient_foundry',
    chance: {
      ancient_military: 5,
      ancient_industry: 3,
      ancient_technology: 2,
      default: 1,
    },
    cost: {
      minerals: 100, // ancient_crafting_techniques tech tree
    },
    upkeep: {
      minerals: 10, // timeless_fabrication_methods tech tree
      energy: 10, // timeless_fabrication_methods tech tree
    },
    production: {
      alloys: 10, // TODO alloy_production tech tree
    },
  },
  ancient_refinery: {
    id: 'ancient_refinery',
    chance: {
      ancient_industry: 5,
      ancient_military: 3,
      ancient_technology: 2,
      default: 1,
    },
    cost: {
      minerals: 100, // traditional_refining_wisdom tech tree
    },
    upkeep: {
      minerals: 10, // ageless_refining_techniques tech tree
      energy: 10, // ageless_refining_techniques tech tree
    },
    production: {
      fuel: 10, // TODO fuel_production tech tree
    },
  },
} as const satisfies Record<string, District>;
export type DistrictName = keyof typeof DISTRICTS;
export const DISTRICT_NAMES = Object.keys(DISTRICTS) as DistrictName[];
