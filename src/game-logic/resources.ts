import type {Resource} from './types';

export const RESOURCES = {
  // special resources
  credits: {
    starting: 1000,
  },
  population: {
    starting: 20,
  },
  // raw resources
  energy: {
    starting: 100,
    credit_value: 1,
  },
  minerals: {
    starting: 100,
    credit_value: 1,
  },
  food: {
    starting: 100,
    credit_value: 1,
  },
  // processed resources
  fuel: {
    starting: 20,
    credit_value: 5,
  },
  research: {
    starting: 20,
  },
  alloys: {
    starting: 20,
    credit_value: 8,
  },
  consumer_goods: {
    starting: 20,
    credit_value: 6,
  },
} as const satisfies Record<string, Resource>;
export type ResourceName = keyof typeof RESOURCES;
export const RESOURCE_NAMES = Object.keys(RESOURCES) as ResourceName[];

