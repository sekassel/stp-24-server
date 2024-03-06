export const EMPIRE_VARIABLES = {
  market: {
    fee: 0.3,
  },
  pop: {
    growth: {
      colonized: 1.10, // pop_growth_colonized tech tree
      upgraded: 1.05, // pop_growth_upgraded tech tree
      developed: 1.01, // pop_growth_developed tech tree
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
      consumption: { // efficient_colonizer tech tree
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
      consumption: { // pandora_conqueror tech tree
        energy: 2,
        fuel: 2,
        food: 2,
        alloys: 1, // upgraded systems provide defense that must be maintained
      },
    },
    developed: {
      cost: {
        alloys: 200, // cheap_claims tech tree
        fuel: 100, // cheap_claims tech tree
      },
      consumption: { // galactus tech tree
        energy: 4,
        fuel: 4,
        food: 4,
        alloys: 3,
      },
    }
  },
} as const;
