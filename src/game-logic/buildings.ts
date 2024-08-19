import type {Building} from './types';

export const BUILDINGS = {
  exchange: {
    id: 'exchange',
    build_time: 9, // fast_building_construction tech tree
    cost: {
      minerals: 100, // cheap_buildings tech tree
    },
    upkeep: {
      energy: 5, // efficient_buildings tech tree
      consumer_goods: 4, // efficient_buildings tech tree
    },
    production: {
      credits: 15, // improved_production tech tree
    },
  },
  // basic resource buildings. cost should be around 75, upkeep around 5, production around 10
  power_plant: {
    id: 'power_plant',
    build_time: 6, // fast_building_construction tech tree
    cost: { // cheap_buildings, improved_production, efficient_resources tech trees
      minerals: 75, // silicon solar collectors // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 3, // efficient_resources tech tree
    },
    production: {
      energy: 18, // energy_production tech tree
    },
  },
  mine: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'mine',
    build_time: 6, // fast_building_construction tech tree
    cost: {
      minerals: 50, // building the supporting structure // cheap_buildings tech tree
      energy: 25, // digging the mine // cheap_buildings tech tree
    },
    upkeep: {
      energy: 3, // powering the mine // efficient_buildings tech tree
    },
    production: {
      minerals: 18, // mineral_production tech tree
    },
  },
  farm: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'farm',
    build_time: 6, // fast_building_construction tech tree
    cost: {
      energy: 75, // tilling the soil // cheap_buildings tech tree
    },
    upkeep: {
      energy: 3, // watering the crops // efficient_buildings tech tree
    },
    production: {
      food: 18, // food_production tech tree
    },
  },
  // advanced resource buildings. cost should be around 100, upkeep around 20, production around 10
  research_lab: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'research_lab',
    build_time: 9, // fast_building_construction tech tree
    cost: {
      minerals: 100, // building the lab // cheap_buildings tech tree
    },
    upkeep: {
      energy: 5, // powering the lab // efficient_buildings tech tree
      consumer_goods: 5, // efficient_buildings tech tree
    },
    production: {
      research: 20, // research_production tech tree
    },
  },
  foundry: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'foundry',
    build_time: 9, // fast_building_construction tech tree
    cost: {
      minerals: 100, // building the foundry // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 5, // the processed materials
      energy: 4, // powering the foundry // efficient_buildings tech tree
    },
    production: {
      alloys: 8, // alloy_production tech tree
    },
  },
  factory: {
    id: 'factory',
    build_time: 9, // fast_building_construction tech tree
    cost: {
      minerals: 100, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 5, // efficient_buildings tech tree
      energy: 4, // efficient_buildings tech tree
    },
    production: {
      consumer_goods: 12, // improved_production tech tree
    },
  },
  refinery: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'refinery',
    build_time: 9, // fast_building_construction tech tree
    cost: {
      minerals: 100, // building the refinery // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 5, // the crude oil
      energy: 4, // powering the refinery // efficient_buildings tech tree
    },
    production: {
      fuel: 10, // fuel_production tech tree
    },
  },
  shipyard: {
    id: 'shipyard',
    build_time: 12, // fast_building_construction tech tree
    healing_rate: 0.1,
    cost: {
      minerals: 50, // cheap_buildings tech tree
      alloys: 75, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 3, // efficient_buildings tech tree
      energy: 2, // efficient_buildings tech tree
      fuel: 1, // efficient_buildings tech tree
      alloys: 5, // efficient_buildings tech tree
    },
    production: {
    },
  },
  fortress: {
    id: 'fortress',
    build_time: 12, // fast_building_construction tech tree
    health: 100,
    defense: 100,
    cost: {
      minerals: 75, // cheap_buildings tech tree
      alloys: 75, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 2, // efficient_buildings tech tree
      energy: 3, // efficient_buildings tech tree
      fuel: 5, // efficient_buildings tech tree
      alloys: 1, // efficient_buildings tech tree
    },
    production: {
    },
  },
} as const satisfies Record<string, Building>;
export type BuildingName = keyof typeof BUILDINGS;
export const BUILDING_NAMES = Object.keys(BUILDINGS) as BuildingName[];
