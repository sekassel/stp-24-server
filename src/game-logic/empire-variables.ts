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
    colonized: {
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
    upgraded: {
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
    developed: {
      cost: {
        alloys: 200, // TODO cheap_claims tech tree
        fuel: 100, // TODO cheap_claims tech tree
      },
      consumption: {
        energy: 4,
        fuel: 4,
        food: 4,
        alloys: 3,
      },
    }
  },
} as const;
