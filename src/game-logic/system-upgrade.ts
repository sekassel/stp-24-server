import {SystemUpgrade} from './types';

export const SYSTEM_UPGRADES = {
  unexplored: {
    id: 'unexplored',
    pop_growth: 1,
    cost: {},
    upkeep: {},
    capacity_multiplier: 1,
  },
  explored: {
    id: 'explored',
    pop_growth: 1,
    cost: {},
    upkeep: {},
    capacity_multiplier: 1,
  },
  colonized: {
    id: 'colonized',
    pop_growth: 0.05, // pop_growth_colonized tech tree
    cost: {
      minerals: 100, // cheap_claims tech tree
      energy: 100, // cheap_claims tech tree
    },
    upkeep: {
      energy: 1,
      minerals: 1,
      fuel: 1,
    },
    capacity_multiplier: 1,
  },
  upgraded: {
    id: 'upgraded',
    pop_growth: 0.02, // pop_growth_upgraded tech tree
    cost: {
      minerals: 100, // cheap_claims tech tree
      alloys: 100, // cheap_claims tech tree
    },
    upkeep: {
      energy: 2,
      minerals: 2,
      fuel: 2,
      alloys: 1, // upgraded systems provide defense that must be maintained
    },
    capacity_multiplier: 1.25,
  },
  developed: {
    id: 'developed',
    pop_growth: 0.01,
    cost: {
      alloys: 200, // cheap_claims tech tree
      fuel: 100, // cheap_claims tech tree
    },
    upkeep: {
      energy: 4,
      minerals: 4,
      fuel: 4,
      alloys: 3,
    },
    capacity_multiplier: 1.25,
  }
} as const satisfies Record<string, SystemUpgrade>;

export type SystemUpgradeName = keyof typeof SYSTEM_UPGRADES;
export const SYSTEM_UPGRADE_NAMES = Object.keys(SYSTEM_UPGRADES) as SystemUpgradeName[];
