import {SystemType} from './types';

export const SYSTEM_TYPES = {
  regular: {
    id: 'regular',
    chance: 10,
    capacity_range: [10, 25],
    district_percentage: 0.9,
  },
  energy: {
    id: 'energy',
    chance: 3,
    capacity_range: [12, 25],
    district_percentage: 1,
  },
  mining: {
    id: 'mining',
    chance: 3,
    capacity_range: [13, 28],
    district_percentage: 1,
  },
  agriculture: {
    id: 'agriculture',
    chance: 3,
    capacity_range: [15, 30],
    district_percentage: 1,
  },
  ancient_technology: {
    id: 'ancient_technology',
    chance: 1,
    capacity_range: [10, 18],
    district_percentage: 0.8,
  },
  ancient_industry: {
    id: 'ancient_industry',
    chance: 1,
    capacity_range: [10, 20],
    district_percentage: 0.8,
  },
  ancient_military: {
    id: 'ancient_military',
    chance: 1,
    capacity_range: [10, 16],
    district_percentage: 0.8,
  },
} as const satisfies Record<string, SystemType>;
export type SystemTypeName = keyof typeof SYSTEM_TYPES;

