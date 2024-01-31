import type {Building} from './types';

export const BUILDINGS = {
  // basic resource buildings. cost should be around 75, upkeep around 5, production around 10
  power_plant: {
    cost: {
      minerals: 75, // silicon solar collectors // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 5, // maintenance
    },
    production: {
      energy: 10, // energy_production tech tree
    },
  },
  mine: {
    cost: {
      minerals: 50, // building the supporting structure // cheap_buildings tech tree
      energy: 25, // digging the mine // cheap_buildings tech tree
    },
    upkeep: {
      energy: 5, // powering the mine // efficient_buildings tech tree
    },
    production: {
      minerals: 10, // mineral_production tech tree
    },
  },
  farm: {
    cost: {
      energy: 75, // tilling the soil // cheap_buildings tech tree
    },
    upkeep: {
      energy: 5, // watering the crops // efficient_buildings tech tree
    },
    production: {
      food: 10, // food_production tech tree
    },
  },
  // advanced resource buildings. cost should be around 100, upkeep around 20, production around 10
  research_lab: {
    cost: {
      minerals: 100, // building the lab // cheap_buildings tech tree
    },
    upkeep: {
      energy: 20, // powering the lab // efficient_buildings tech tree
    },
    production: {
      research: 10, // research_production tech tree
    },
  },
  foundry: {
    cost: {
      minerals: 100, // building the foundry // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 10, // the processed materials
      energy: 10, // powering the foundry // efficient_buildings tech tree
    },
    production: {
      alloys: 10, // alloy_production tech tree
    },
  },
  refinery: {
    cost: {
      minerals: 100, // building the refinery // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 10, // the crude oil
      energy: 10, // powering the refinery // efficient_buildings tech tree
    },
    production: {
      fuel: 10, // fuel_production tech tree
    },
  },
} as const satisfies Record<string, Building>;
export type BuildingName = keyof typeof BUILDINGS;
export const BUILDING_NAMES = Object.keys(BUILDINGS) as BuildingName[];
