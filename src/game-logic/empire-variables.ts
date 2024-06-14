export const EMPIRE_VARIABLES = {
  market: { // market fee reduction tech tree
    fee: 0.3,
  },
  pop: {
    /** How many pops a colonized system starts with */
    colonists: 1, // TODO(Maiswaffeln): colonization tech tree
    consumption: {
      food: 1, // nutrition tech tree
      credits: {
        unemployed: 1, // social benefits tech tree
      },
    },
  },
  technologies: {
    difficulty: 100, // global variable to control tech tree difficulty
    cost_multiplier: 0.95, // cost reduction for previously unlocked techs
  },
} as const;
