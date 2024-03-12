export const EMPIRE_VARIABLES = {
  market: {
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
    costMultiplier: 0.95,
  },
} as const;
