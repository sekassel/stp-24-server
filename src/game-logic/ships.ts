import {ShipType} from "../fleet/ship-type.schema";

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
} as const satisfies Record<string, ShipType>;
export type ShipTypeName = keyof typeof SHIP_TYPES;
