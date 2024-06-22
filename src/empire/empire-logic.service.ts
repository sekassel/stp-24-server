import {BadRequestException, Injectable} from '@nestjs/common';
import {Empire, EmpireDocument} from './empire.schema';
import {TECH_CATEGORIES, TECHNOLOGIES} from '../game-logic/technologies';
import {notFound} from '@mean-stream/nestx';
import {Technology, TechnologyTag, Variable} from '../game-logic/types';
import {calculateVariable, calculateVariables, getVariables} from '../game-logic/variables';
import {RESOURCE_NAMES, ResourceName} from '../game-logic/resources';
import {AggregateResult} from '../game-logic/aggregates';
import {EMPIRE_VARIABLES} from '../game-logic/empire-variables';
import {EmpireTemplate} from './empire.dto';

@Injectable()
export class EmpireLogicService {
  constructor(
    // Keep injections to a minimum, we want this to be pure logic
  ) {
  }

  tradeResources(empire: EmpireDocument, resources: Record<ResourceName, number>) {
    const resourceVariables = getVariables('resources');
    calculateVariables(resourceVariables, empire);
    const marketFee = calculateVariable('empire.market.fee', empire);
    for (const [resource, change] of Object.entries(resources)) {
      const resourceAmount = Math.abs(change);

      if (resourceAmount === 0) {
        continue;
      }
      const creditValue = resourceVariables[`resources.${resource}.credit_value` as Variable];

      if (creditValue === 0) {
        throw new BadRequestException(`The resource ${resource} cannot be bought or sold.`);
      }
      const totalMarketFee = creditValue * marketFee;
      const creditValueWithFee = creditValue + (change < 0 ? -totalMarketFee : totalMarketFee);
      const resourceCost = creditValueWithFee * resourceAmount;

      if (change < 0) {
        // Sell the resource
        if (empire.resources[resource as ResourceName] < resourceAmount) {
          throw new BadRequestException(`The empire does not have enough ${resource} to sell.`);
        }
        // Update empire: get credits, subtract resource
        empire.resources.credits += resourceCost;
        empire.resources[resource as ResourceName] -= resourceAmount;
      } else if (change > 0) {
        // Buy the resource
        if (resourceCost > empire.resources.credits) {
          throw new BadRequestException(`Not enough credits to buy ${change} ${resource}.`);
        }
        // Update empire, subtract credits, add resource
        empire.resources.credits -= resourceCost;
        empire.resources[resource as ResourceName] += resourceAmount;
      }
    }
    empire.markModified('resources');
  }

  getInitialResources(empire: EmpireTemplate): Record<ResourceName, number> {
    const resourceVariables: Record<Variable, number> = getVariables('resources');
    calculateVariables(resourceVariables, {
      traits: empire.traits,
      technologies: [],
    });
    const resources: any = {};
    for (const resource of RESOURCE_NAMES) {
      resources[resource] = resourceVariables[`resources.${resource}.starting`];
    }
    return resources;
  }

  getCosts(prefix: string, variables: Partial<Record<Variable, number>>): Partial<Record<ResourceName, number>> {
    const result: Partial<Record<ResourceName, number>> = {};
    for (const resource of RESOURCE_NAMES) { // support custom variables
      const variable = `${prefix}.${resource}`;
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

  getTechnologyTime(empire: Empire, technology: Technology, aggregate?: AggregateResult) {
    return this.getTechnologyAggregate(empire, technology, 'research_time', 'time_multiplier', aggregate);
  }

  getTechnologyCost(empire: Empire, technology: Technology, aggregate?: AggregateResult) {
    return this.getTechnologyAggregate(empire, technology, 'difficulty', 'cost_multiplier', aggregate);
  }

  private getTechnologyAggregate(
    empire: Empire, technology: Technology,
    baseVar: keyof (typeof EMPIRE_VARIABLES)['technologies'],
    tagVar: keyof (typeof TECH_CATEGORIES)[TechnologyTag],
    aggregate?: AggregateResult,
  ) {
    const baseVariable: Variable = `empire.technologies.${baseVar}`;
    const variables: Partial<Record<Variable, number>> = {
      [baseVariable]: EMPIRE_VARIABLES.technologies[baseVar],
    };
    for (const tag of technology.tags) {
      variables[`technologies.${tag}.${tagVar}`] = TECH_CATEGORIES[tag][tagVar];
    }
    calculateVariables(variables, empire);

    const difficultyMultiplier = variables[baseVariable] || 1;
    let technologyCost = technology.cost * difficultyMultiplier;
    aggregate?.items.push({
      variable: baseVariable,
      count: technology.cost,
      subtotal: technologyCost,
    });

    for (const tag of technology.tags) {
      const tagVariable: Variable = `technologies.${tag}.${tagVar}`;
      const tagCostMultiplier = variables[tagVariable] || 1;
      const newTotal = technologyCost * tagCostMultiplier;
      aggregate?.items.push({
        variable: tagVariable,
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
