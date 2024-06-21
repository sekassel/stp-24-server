import {BadRequestException, Injectable} from '@nestjs/common';
import {EmpireDocument} from './empire.schema';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {notFound} from '@mean-stream/nestx';
import {UserDocument} from '../user/user.schema';
import {Technology} from '../game-logic/types';
import {calculateVariables, getVariables} from '../game-logic/variables';

@Injectable()
export class EmpireLogicService {
  constructor(
    // Keep injections to a minimum, we want this to be pure logic
  ) {
  }

  getTechnologyCost(user: UserDocument, empire: EmpireDocument, technology: Technology) {
    const variables = {
      ...getVariables('technologies'),
      ...getVariables('empire'),
    };
    calculateVariables(variables, empire);
    const technologyCount = user.technologies?.[technology.id] || 0;

    const difficultyMultiplier = variables['empire.technologies.difficulty'] || 1;
    let technologyCost = technology.cost * difficultyMultiplier;

    // step 1: if the user has already unlocked this tech, decrease the cost exponentially
    if (technologyCount) {
      const baseCostMultiplier = variables['empire.technologies.cost_multiplier'] || 1;
      const unlockCostMultiplier = baseCostMultiplier ** Math.min(technologyCount, 10);
      technologyCost *= unlockCostMultiplier;
    }

    // step 2: apply tag multipliers
    for (const tag of technology.tags) {
      const tagCostMultiplier = variables[`technologies.${tag}.cost_multiplier`] || 1;
      technologyCost *= tagCostMultiplier;
    }

    // step 3: round the cost
    return Math.round(technologyCost);
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

    /* TODO: Increment the user's technology count by 1
    if (user.technologies) {
      user.technologies[technologyId] = (user.technologies?.[technologyId] ?? 0) + 1;
      user.markModified('technologies');
    } else {
      user.technologies = {[technologyId]: 1};
    }
     */
  }

}
