import {BadRequestException, Injectable} from '@nestjs/common';
import {Empire, EmpireDocument} from './empire.schema';
import {TECH_CATEGORIES, TECHNOLOGIES} from '../game-logic/technologies';
import {notFound} from '@mean-stream/nestx';
import {UserDocument} from '../user/user.schema';
import {Technology, Variable} from '../game-logic/types';
import {calculateVariables, getVariables, VARIABLES} from '../game-logic/variables';
import {RESOURCE_NAMES, ResourceName} from '../game-logic/resources';
import {SystemDocument} from '../system/system.schema';
import {AggregateResult} from '../game-logic/aggregates';
import {EMPIRE_VARIABLES} from '../game-logic/empire-variables';

@Injectable()
export class EmpireLogicService {
  constructor(
    // Keep injections to a minimum, we want this to be pure logic
  ) {
  }

  getCosts(prefix: keyof typeof VARIABLES, name: string, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {
    const result: Partial<Record<ResourceName, number>> = {};
    const variables = getVariables(prefix);
    calculateVariables(variables, empire, system);
    for (const resource of RESOURCE_NAMES) { // support custom variables
      const variable = `${prefix}.${name}.cost.${resource}`;
      if (variable in variables) {
        result[resource] = variables[variable as Variable];
      }
    }
    return result;
  }

  refundResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>) {
    for (const [resource, amount] of Object.entries(cost) as [ResourceName, number][] ) {
      if (empire.resources[resource] !== undefined) {
        empire.resources[resource] += amount;
      } else {
        empire.resources[resource] = amount;
      }
    }
    empire.markModified('resources');
  }

  deductResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>): void {
    const missingResources = Object.entries(cost)
      .filter(([resource, amount]) => empire.resources[resource as ResourceName] < amount)
      .map(([resource, _]) => resource);
    if (missingResources.length) {
      throw new BadRequestException(`Not enough resources: ${missingResources.join(', ')}`);
    }
    for (const [resource, amount] of Object.entries(cost)) {
      empire.resources[resource as ResourceName] -= amount;
    }
    empire.markModified('resources');
  }

  getTechnologyCost(empire: Empire, technology: Technology, aggregate?: AggregateResult) {
    const variables: Partial<Record<Variable, number>> = {
      'empire.technologies.difficulty': EMPIRE_VARIABLES.technologies.difficulty,
    };
    for (const tag of technology.tags) {
      variables[`technologies.${tag}.cost_multiplier`] = TECH_CATEGORIES[tag].cost_multiplier;
    }
    calculateVariables(variables, empire);

    const difficultyMultiplier = variables['empire.technologies.difficulty'] || 1;
    let technologyCost = technology.cost * difficultyMultiplier;
    aggregate?.items.push({
      variable: 'empire.technologies.difficulty',
      count: technology.cost,
      subtotal: technologyCost,
    });

    for (const tag of technology.tags) {
      const tagCostMultiplier = variables[`technologies.${tag}.cost_multiplier`] || 1;
      const newTotal = technologyCost * tagCostMultiplier;
      aggregate?.items.push({
        variable: `technologies.${tag}.cost_multiplier`,
        count: 1,
        subtotal: newTotal - technologyCost,
      });
      technologyCost = newTotal;
    }

    aggregate && (aggregate.total = technologyCost);
    return technologyCost;
  }

  unlockTechnology(technologyId: string, empire: EmpireDocument) {
    const technology = TECHNOLOGIES[technologyId] ?? notFound(`Technology ${technologyId} not found.`);

    if (empire.technologies.includes(technologyId)) {
      throw new BadRequestException(`Technology ${technologyId} has already been unlocked.`);
    }

    // Check if all required technologies are unlocked
    const missingRequiredTechnologies = technology.requires?.filter(tech => !empire.technologies.includes(tech));
    if (missingRequiredTechnologies?.length) {
      throw new BadRequestException(`Required technologies for ${technologyId}: ${missingRequiredTechnologies.join(', ')}.`);
    }

    empire.technologies.push(technologyId);
  }

}
