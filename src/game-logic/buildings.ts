import type {Building} from './types';

export const BUILDINGS = {
  exchange: {
    id: 'exchange',
    build_time: 9,
    cost: {
      minerals: 100, // cheap_buildings tech tree
    },
    upkeep: {
      energy: 5, // efficient_buildings tech tree
      consumer_goods: 5, // efficient_buildings tech tree
    },
    production: {
      credits: 20, // improved_production tech tree
    },
  },
  // basic resource buildings. cost should be around 75, upkeep around 5, production around 10
  power_plant: {
    id: 'power_plant',
    build_time: 6,
    cost: { // cheap_buildings, improved_production, efficient_resources tech trees
      minerals: 75, // silicon solar collectors // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 2, // efficient_resources tech tree
    },
    production: {
      energy: 20, // energy_production tech tree
    },
  },
  mine: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'mine',
    build_time: 6,
    cost: {
      minerals: 50, // building the supporting structure // cheap_buildings tech tree
      energy: 25, // digging the mine // cheap_buildings tech tree
    },
    upkeep: {
      energy: 2, // powering the mine // efficient_buildings tech tree
      fuel: 2, // efficient_buildings tech tree
    },
    production: {
      minerals: 24, // mineral_production tech tree
    },
  },
  farm: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'farm',
    build_time: 6,
    cost: {
      energy: 75, // tilling the soil // cheap_buildings tech tree
    },
    upkeep: {
      energy: 2, // watering the crops // efficient_buildings tech tree
      fuel: 2, // efficient_buildings tech tree
    },
    production: {
      food: 24, // food_production tech tree
    },
  },
  // advanced resource buildings. cost should be around 100, upkeep around 20, production around 10
  research_lab: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'research_lab',
    build_time: 9,
    cost: {
      minerals: 100, // building the lab // cheap_buildings tech tree
    },
    upkeep: {
      energy: 10, // powering the lab // efficient_buildings tech tree
      consumer_goods: 5, // efficient_buildings tech tree
    },
    production: {
      research: 10, // research_production tech tree
    },
  },
  foundry: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'foundry',
    build_time: 9,
    cost: {
      minerals: 100, // building the foundry // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 15, // the processed materials
      energy: 10, // powering the foundry // efficient_buildings tech tree
    },
    production: {
      alloys: 10, // alloy_production tech tree
    },
  },
  factory: {
    id: 'factory',
    build_time: 9,
    cost: {
      minerals: 100, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 15, // efficient_buildings tech tree
      energy: 10, // efficient_buildings tech tree
    },
    production: {
      consumer_goods: 10, // improved_production tech tree
    },
  },
  refinery: { // cheap_buildings, efficient_buildings, improved_production tech trees
    id: 'refinery',
    build_time: 9,
    cost: {
      minerals: 100, // building the refinery // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 10, // the crude oil
      energy: 15, // powering the refinery // efficient_buildings tech tree
    },
    production: {
      fuel: 10, // fuel_production tech tree
    },
  },
  shipyard: {
    id: 'shipyard',
    build_time: 12,
    cost: {
      minerals: 50, // cheap_buildings tech tree
      alloys: 75, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 10, // efficient_buildings tech tree
      energy: 5, // efficient_buildings tech tree
      fuel: 5, // efficient_buildings tech tree
      alloys: 10, // efficient_buildings tech tree
    },
    production: {
    },
  },
  fortress: {
    id: 'fortress',
    build_time: 12,
    health: 100,
    defense: 100,
    cost: {
      minerals: 75, // cheap_buildings tech tree
      alloys: 75, // cheap_buildings tech tree
    },
    upkeep: {
      minerals: 5, // efficient_buildings tech tree
      energy: 8, // efficient_buildings tech tree
      fuel: 8, // efficient_buildings tech tree
      alloys: 5, // efficient_buildings tech tree
    },
    production: {
    },
  },
} as const satisfies Record<string, Building>;
export type BuildingName = keyof typeof BUILDINGS;
export const BUILDING_NAMES = Object.keys(BUILDINGS) as BuildingName[];
