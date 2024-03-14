export const EMPIRE_VARIABLES = {
  market: { // market fee reduction tech tree
    fee: 0.3,
  },
  pop: {
    consumption: {
      food: 0.1, // nutrition tech tree
      credits: {
        unemployed: 0.1, // social benefits tech tree
      },
    },
  },
  technologies: {
    cost_multiplier: 0.95,
  },
} as const;
