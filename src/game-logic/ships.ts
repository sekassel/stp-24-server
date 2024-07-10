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
    speed: 5, // ship_speed tech tree
    attack: {
    },
    defense: {
      default: 10,
      destroyer: 5,
      cruiser: 5,
      battleship: 1,
      carrier: 1,
      dreadnought: 1,
    },
    cost: { // cheap_ships tech tree
      minerals: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      energy: 5,
    },
  },

  /** Colonization and expansion. */
  colonizer: { // colony
    id: 'colonizer',
    build_time: 5, // ship_construction + faster_ship_construction tech tree
    health: 100, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
    },
    defense: {
      default: 10,
      destroyer: 5,
      cruiser: 5,
      battleship: 1,
      carrier: 1,
      dreadnought: 1,
    },
    cost: { // cheap_ships tech tree
      minerals: 100,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      energy: 8,
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
    health: 200, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      energy: 10,
    },
  },

  /** Space superiority and dogfighting. */
  fighter: {
    id: 'fighter',
    build_time: 4, // small_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 75,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      energy: 10,
    },
  },

  // All ships from here have to be unlocked by tech tree -> build_time = 0

  /** Light skirmisher and scout. */
  corvette: {
    id: 'corvette',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 100,
      energy: 50,
    },
    upkeep: { // efficient_ships tech tree
      energy: 10,
    },
  },

  /** Anti-capital ship warfare. */
  bomber: {
    id: 'bomber',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 10, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 125,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      energy: 10,
    },
  },

  /** Light escort and multi-role vessel. */
  frigate: {
    id: 'frigate',
    build_time: 0, // small_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 8, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 125,
      energy: 75,
    },
    upkeep: { // efficient_ships tech tree
      energy: 10,
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
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 250,
      energy: 150,
    },
    upkeep: { // efficient_ships tech tree
      energy: 20,
    },
  },

  /** Frontline combat and fleet coordination. */
  cruiser: {
    id: 'cruiser',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 300,
      energy: 200,
    },
    upkeep: { // efficient_ships tech tree
      energy: 25,
    },
  },

  /** The Vanguard is a specialized support ship, designed to enhance fleet capabilities through electronic warfare and
   * tactical coordination. */
  vanguard: {
    id: 'vanguard',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 300,
      energy: 200,
    },
    upkeep: { // efficient_ships tech tree
      energy: 25,
    },
  },

  /** The Sentinel serves as a heavily armed and armored patrol ship designed to secure key locations and provide robust
   * defense against enemy incursions. */
  sentinel: {
    id: 'sentinel',
    build_time: 0, // medium_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 300,
      energy: 200,
    },
    upkeep: { // efficient_ships tech tree
      energy: 25,
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
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 750,
      energy: 250,
    },
    upkeep: { // efficient_ships tech tree
      energy: 100,
    },
  },

  /** Fleet support and strike craft deployment. */
  carrier: {
    id: 'carrier',
    build_time: 0, // large_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 800,
      energy: 400,
    },
    upkeep: { // efficient_ships tech tree
      energy: 200,
    },
  },

  /** Super-heavy combat and fleet command. */
  dreadnought: {
    id: 'dreadnought',
    build_time: 0, // large_ship_construction + faster_ship_construction tech tree
    health: 200, // armor_plating tech tree
    speed: 5, // ship_speed tech tree
    attack: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    defense: {
      default: 50,
      cruiser: 30,
      battleship: 20,
      carrier: 50,
      dreadnought: 10,
    },
    cost: { // cheap_ships tech tree
      minerals: 1200,
      energy: 500,
    },
    upkeep: { // efficient_ships tech tree
      energy: 300,
    },
  },

} as const;
export type ShipTypeName = keyof typeof SHIP_TYPES;
