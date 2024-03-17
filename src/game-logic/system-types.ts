export const SYSTEM_TYPES = {
  regular: {
    chance: 10,
    capacity_range: [10, 25],
    district_percentage: 0.8,
  },
  energy: {
    chance: 3,
    capacity_range: [12, 25],
    district_percentage: 0.8,
  },
  mining: {
    chance: 3,
    capacity_range: [13, 28],
    district_percentage: 0.8,
  },
  agriculture: {
    chance: 3,
    capacity_range: [15, 30],
    district_percentage: 0.8,
  },
  ancient_technology: {
    chance: 1,
    capacity_range: [10, 18],
    district_percentage: 0.8,
  },
  ancient_industry: {
    chance: 1,
    capacity_range: [10, 20],
    district_percentage: 0.8,
  },
  ancient_military: {
    chance: 1,
    capacity_range: [10, 16],
    district_percentage: 0.8,
  },
} as const;
export type SystemType = keyof typeof SYSTEM_TYPES;
