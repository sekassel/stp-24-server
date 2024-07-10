import {ShipType} from './types';

export const SHIP_TYPES = {
  /**
   * Utility
   * */

  explorer: { // science
    id: 'explorer',
    build_time: 4,
    health: 100,
    speed: 5,
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
    cost: {
      minerals: 75,
      energy: 50,
    },
    upkeep: {
      energy: 5,
    },
  },

  colonizer: { // colony
    id: 'colonizer',
    build_time: 5,
    health: 100,
    speed: 5,
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
    cost: {
      minerals: 100,
      energy: 75,
    },
    upkeep: {
      energy: 8,
    },
  },

  /**
   * Small
   * */
  interceptor: {
    id: 'interceptor',
    build_time: 4,
    health: 200,
    speed: 10,
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
    cost: {
      minerals: 75,
      energy: 50,
    },
    upkeep: {
      energy: 10,
    },
  },

  fighter: {
    id: 'fighter',
    build_time: 4,
    health: 200,
    speed: 10,
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
    cost: {
      minerals: 75,
      energy: 50,
    },
    upkeep: {
      energy: 10,
    },
  },

  // All ships from here have to be unlocked by tech tree -> build_time = 0
  corvette: {
    id: 'corvette',
    build_time: 0, // fast_small_ship_production tech tree
    health: 200,
    speed: 10,
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
    cost: {
      minerals: 100,
      energy: 50,
    },
    upkeep: {
      energy: 10,
    },
  },

  bomber: {
    id: 'bomber',
    build_time: 0, // fast_small_ship_production tech tree
    health: 200,
    speed: 10,
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
    cost: {
      minerals: 125,
      energy: 75,
    },
    upkeep: {
      energy: 10,
    },
  },

  frigate: {
    id: 'frigate',
    build_time: 0, // fast_small_ship_production tech tree
    health: 200,
    speed: 8,
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
    cost: {
      minerals: 125,
      energy: 75,
    },
    upkeep: {
      energy: 10,
    },
  },

  /**
   * Medium
   * */

  destroyer: {
    id: 'destroyer',
    build_time: 0,
    health: 200,
    speed: 5,
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
    cost: {
      minerals: 250,
      energy: 150,
    },
    upkeep: {
      energy: 20,
    },
  },

  cruiser: {
    id: 'cruiser',
    build_time: 0,
    health: 200,
    speed: 5,
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
    cost: {
      minerals: 300,
      energy: 200,
    },
    upkeep: {
      energy: 25,
    },
  },

  /**
   * Large
   * */

  battleship: {
    id: 'battleship',
    build_time: 0,
    health: 200,
    speed: 5,
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
    cost: {
      minerals: 750,
      energy: 250,
    },
    upkeep: {
      energy: 100,
    },
  },

  carrier: {
    id: 'carrier',
    build_time: 0,
    health: 200,
    speed: 5,
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
    cost: {
      minerals: 800,
      energy: 400,
    },
    upkeep: {
      energy: 200,
    },
  },

  dreadnought: {
    id: 'dreadnought',
    build_time: 0,
    health: 200,
    speed: 5,
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
    cost: {
      minerals: 1200,
      energy: 500,
    },
    upkeep: {
      energy: 300,
    },
  },

} as const;
export type ShipTypeName = keyof typeof SHIP_TYPES;
