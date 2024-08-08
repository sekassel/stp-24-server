import type {Resource} from './types';

export const RESOURCES = {
  // special resources
  credits: {
    starting: 1000,
  },
  population: {
    starting: 25,
  },
  research: {
    starting: 300,
  },
  // raw resources
  energy: {
    starting: 500,
    credit_value: 1,
  },
  minerals: {
    starting: 500,
    credit_value: 1,
  },
  food: {
    starting: 500,
    credit_value: 1,
  },
  // processed resources
  fuel: {
    starting: 100,
    credit_value: 5,
  },
  alloys: {
    starting: 100,
    credit_value: 8,
  },
  consumer_goods: {
    starting: 100,
    credit_value: 6,
  },
} as const satisfies Record<string, Resource>;
export type ResourceName = keyof typeof RESOURCES;
export const RESOURCE_NAMES = Object.keys(RESOURCES) as ResourceName[];

