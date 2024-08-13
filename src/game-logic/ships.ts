import {ShipType} from './types';

export const SHIP_TYPES = {
  /**
   * Utility
   * */

  /** Exploration and research. */
  explorer: { // science
    id: 'explorer',
    build_time: 4, // ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 15, // ship_speed tech tree
    attack: {},
    defense: {
      default: 10,
    },
    cost: { // cheap_ships tech tree
      alloys: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2,
      energy: 0.4,
    },
  },

  /** Colonization and expansion. */
  colonizer: { // colony
    id: 'colonizer',
    build_time: 5, // ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 15, // ship_speed tech tree
    attack: {},
    defense: {
      default: 10,
    },
    cost: { // cheap_ships tech tree
      alloys: 100,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2,
      energy: 0.4,
    },
  },
  /** =============================================================================================================== */

  /**
   * Small
   * */

  /** Rapid response and short-range combat. */
  interceptor: {
    id: 'interceptor',
    build_time: 4, // small_ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 14, // ship_speed tech tree
    attack: { // small_fighters tech tree
      default: 10,
      fighter: 30,
      corvette: 30,
      bomber: 30,
      frigate: 30,
    },
    defense: { // small_ship_defense tech tree
      default: 10,
    },
    cost: { // cheap_ships tech tree
      alloys: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2,
      energy: 0.4,
    },
  },

  /** Space superiority and dogfighting. */
  fighter: {
    id: 'fighter',
    build_time: 4, // small_ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 12, // ship_speed tech tree
    attack: { // small_fighters tech tree
      default: 10,
      interceptor: 30,
      corvette: 50,
      bomber: 50,
      frigate: 50,
    },
    defense: { // small_ship_defense tech tree
      default: 10,
    },
    cost: { // cheap_ships tech tree
      alloys: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2.5,
      energy: 0.5,
    },
  },

  // All ships from here have to be unlocked by tech tree -> build_time = 0

  /** Light skirmisher and scout. */
  corvette: {
    id: 'corvette',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: { // small_fighters tech tree
      default: 30,
    },
    defense: { // small_ship_defense tech tree
      default: 30,
    },
    cost: { // cheap_ships tech tree
      alloys: 100,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2.5,
      energy: 0.5,
    },
  },

  /** Anti-capital ship warfare. */
  bomber: {
    id: 'bomber',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 150, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: { // small_fighters tech tree
      default: 30,
      corvette: 50,
      frigate: 50,
      system: 50,
    },
    defense: { // small_ship_defense tech tree
      default: 30,
    },
    cost: { // cheap_ships tech tree
      alloys: 125,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2.5,
      energy: 0.5,
    },
  },

  /** Light escort and multi-role vessel. */
  frigate: {
    id: 'frigate',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 150, // armor_plating tech tree
    speed: 8, // ship_speed tech tree
    attack: { // small_fighters tech tree
      default: 50,
    },
    defense: { // small_ship_defense tech tree
      default: 50,
    },
    cost: { // cheap_ships tech tree
      alloys: 125,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 2.5,
      energy: 0.5,
    },
  },
  /** =============================================================================================================== */

  /**
   * Medium
   * */

  /** Escort and anti-small ship warfare. */
  destroyer: {
    id: 'destroyer',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 250, // armor_plating tech tree
    speed: 7, // ship_speed tech tree
    attack: { // medium_fighters tech tree
      default: 50,
    },
    defense: { // medium_ship_defense tech tree
      default: 50,
    },
    cost: { // cheap_ships tech tree
      alloys: 250,
      energy: 125,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 5,
      energy: 1,
    },
  },

  /** Frontline combat and fleet coordination. */
  cruiser: {
    id: 'cruiser',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 300, // armor_plating tech tree
    speed: 6, // ship_speed tech tree
    attack: { // medium_fighters tech tree
      default: 100,
    },
    defense: { // medium_ship_defense tech tree
      default: 100,
    },
    cost: { // cheap_ships tech tree
      alloys: 250,
      energy: 150,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 6.25,
      energy: 1.25,
    },
  },

  /** The Vanguard is a specialized support ship, designed to enhance fleet capabilities through electronic warfare and
   * tactical coordination. */
  vanguard: {
    id: 'vanguard',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 300, // armor_plating tech tree
    speed: 6, // ship_speed tech tree
    attack: { // medium_fighters tech tree
      default: 150,
    },
    defense: { // medium_ship_defense tech tree
      default: 150,
    },
    cost: { // cheap_ships tech tree
      alloys: 300,
      energy: 200,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 6.25,
      energy: 1.25,
    },
  },

  /** The Sentinel serves as a heavily armed and armored patrol ship designed to secure key locations and provide robust
   * defense against enemy incursions. */
  sentinel: {
    id: 'sentinel',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 300, // armor_plating tech tree
    speed: 6, // ship_speed tech tree
    attack: { // medium_fighters tech tree
      default: 200,
    },
    defense: { // medium_ship_defense tech tree
      default: 200,
    },
    cost: { // cheap_ships tech tree
      alloys: 350,
      energy: 250,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 6.25,
      energy: 1.25,
    },
  },
  /** =============================================================================================================== */

  /**
   * Large
   * */

  /** Heavy frontline combat. */
  battleship: {
    id: 'battleship',
    build_time: 0, // large_ship_construction + faster_ship_construction tech tree
    health: 600, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: { // large_fighters tech tree
      default: 250,
    },
    defense: { // large_ship_defense tech tree
      default: 250,
    },
    cost: { // cheap_ships tech tree
      alloys: 750,
      energy: 250,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 12.5,
      energy: 2.5,
    },
  },

  /** Fleet support and strike craft deployment. */
  carrier: {
    id: 'carrier',
    build_time: 0, // large_ship_construction + faster_ship_construction tech tree
    health: 800, // armor_plating tech tree
    speed: 4, // ship_speed tech tree
    attack: { // large_fighters tech tree
      default: 300,
    },
    defense: { // large_ship_defense tech tree
      default: 300,
    },
    cost: { // cheap_ships tech tree
      alloys: 800,
      energy: 400,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 20,
      energy: 4,
    },
  },

  /** Super-heavy combat and fleet command. */
  dreadnought: {
    id: 'dreadnought',
    build_time: 0, // large_ship_construction + faster_ship_construction tech tree
    health: 1000, // armor_plating tech tree
    speed: 3, // ship_speed tech tree
    attack: { // large_fighters tech tree
      default: 400,
    },
    defense: { // large_ship_defense tech tree
      default: 400,
    },
    cost: { // cheap_ships tech tree
      alloys: 1200,
      energy: 500,
    },
    upkeep: { // efficient_ships tech tree
      fuel: 25,
      energy: 5,
    },
  },

} as const satisfies Record<string, ShipType>;
export type ShipTypeName = keyof typeof SHIP_TYPES;
export const SHIP_NAMES = Object.keys(SHIP_TYPES) as ShipTypeName[];
