export const SYSTEM_TYPES = {
  energy: {
    chance: 3,
  },
  mining: {
    chance: 3,
  },
  agriculture: {
    chance: 3,
  },
  ancient_technology: {
    chance: 1,
  },
  ancient_industry: {
    chance: 1,
  },
  ancient_military: {
    chance: 1,
  },
  regular: {
    chance: 10,
  },
} as const;
export type SystemType = keyof typeof SYSTEM_TYPES;
