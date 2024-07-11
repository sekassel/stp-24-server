import {ShipType} from './types';

export const SHIP_TYPES = {
  fighter: {
    id: 'fighter',
    build_time: 3,
    health: 100,
    speed: 5,
    attack: {
      destroyer: 50,
      cruiser: 30,
      battleship: 20,
    },
    defense: {
      destroyer: 20,
      cruiser: 30,
      battleship: 50,
    },
    cost: {
      minerals: 200,
      energy: 100,
    },
    upkeep: {
      energy: 10,
    },
  },
  science: {
    id: 'science',
    build_time: 3,
    health: 100,
    speed: 5,
    attack: {
      destroyer: 50,
      cruiser: 30,
      battleship: 20,
    },
    defense: {
      default: 20,
    },
    cost: {
      minerals: 200,
      energy: 100,
    },
    upkeep: {
      energy: 10,
    },
  },
  colony: {
    id: 'colony',
    build_time: 3,
    health: 100,
    speed: 5,
    attack: {
      destroyer: 50,
      cruiser: 30,
      battleship: 20,
    },
    defense: {
      default: 20,
    },
    cost: {
      minerals: 200,
      energy: 100,
    },
    upkeep: {
      energy: 10,
    },
  },
} as const satisfies Record<string, ShipType>;
export type ShipTypeName = keyof typeof SHIP_TYPES;
