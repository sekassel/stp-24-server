export const EMPIRE_VARIABLES = {
  pop: {
    growth: {
      /** Pop growth in systems where all building slots are filled */
      developed: 1.01,
      /** Pop growth in systems where there are still building slots available */
      developing: 1.05, // pop growth tech tree
    },
    consumption: {
      food: 0.1, // nutrition tech tree
      credits: {
        unemployed: 0.1, // social benefits tech tree
      },
    },
  },
  system: {
    claim: {
      /** Number of total building slots */
      capacity: 10,
      cost: {
        minerals: 100, // cheap_claims tech tree
        energy: 100, // cheap_claims tech tree
      },
      consumption: {
        energy: 1,
        fuel: 1,
        food: 1,
      },
    },
    upgrade: {
      capacity: 15,
      cost: {
        minerals: 100, // cheap_claims tech tree
        alloys: 100, // cheap_claims tech tree
      },
      consumption: {
        energy: 2,
        fuel: 2,
        food: 2,
        alloys: 1, // upgraded systems provide defense that must be maintained
      },
    },
  },
} as const;
