export const EMPIRE_VARIABLES = {
  market: { // market fee reduction tech tree
    fee: 0.3,
  },
  pop: {
    /** How many pops a colonized system starts with */
    colonists: 1, // TODO(Maiswaffeln): colonization tech tree
    /** Periodic costs for pops */
    consumption: {
      food: 1, // nutrition tech tree
    },
    /** Periodic costs for unemployed pops */
    unemployed_upkeep: {
      credits: 1, // unemployed_pop_cost tech tree
    },
  },
  technologies: {
    difficulty: 100, // global variable to control tech tree difficulty
  },
} as const;
