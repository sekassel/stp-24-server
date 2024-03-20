import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository, notFound} from '@mean-stream/nestx';
import {Empire, EmpireDocument} from './empire.schema';
import {EmpireTemplate, ReadEmpireDto, UpdateEmpireDto} from './empire.dto';
import {MemberService} from '../member/member.service';
import {COLOR_PALETTE, EMPIRE_PREFIX_PALETTE, EMPIRE_SUFFIX_PALETTE, MAX_EMPIRES} from '../game-logic/constants';
import {generateTraits} from '../game-logic/traits';
import {TECHNOLOGIES} from "../game-logic/technologies";
import {UserService} from "../user/user.service";
import {RESOURCE_NAMES, ResourceName, RESOURCES} from '../game-logic/resources';
import {Technology, Variable} from '../game-logic/types';
import {calculateVariable, calculateVariables, flatten, getVariables} from '../game-logic/variables';
import {Game, GameDocument} from '../game/game.schema';
import {SYSTEM_TYPES} from '../game-logic/system-types';
import {EMPIRE_VARIABLES} from '../game-logic/empire-variables';
import {UserDocument} from '../user/user.schema';

function findMissingTechnologies(technologyId: string): string[] {
  const missingTechs: string[] = [];
  const technology = TECHNOLOGIES[technologyId];
  if (technology.requires) {
    for (const requiredTechnology of technology.requires) {
      missingTechs.push(requiredTechnology);
      missingTechs.push(...findMissingTechnologies(requiredTechnology));
    }
  }
  return missingTechs;
}

@Injectable()
@EventRepository()
export class EmpireService extends MongooseRepository<Empire> {
  constructor(
    @InjectModel(Empire.name) model: Model<Empire>,
    private eventEmitter: EventService,
    private memberService: MemberService,
    private userService: UserService,
  ) {
    super(model);
  }

  generateTemplate(): EmpireTemplate {
    return {
      name: EMPIRE_PREFIX_PALETTE.random() + ' ' + EMPIRE_SUFFIX_PALETTE.random(),
      color: COLOR_PALETTE.random(),
      flag: Math.randInt(MAX_EMPIRES) + 1,
      portrait: Math.randInt(MAX_EMPIRES) + 1,
      traits: generateTraits(),
    };
  }

  mask(empire: Empire | EmpireDocument): ReadEmpireDto {
    if (empire instanceof Document) {
      empire = empire.toObject();
    }
    const {resources, technologies, traits, ...rest} = empire;
    return rest;
  }

  async updateEmpire(empire: EmpireDocument, dto: UpdateEmpireDto): Promise<EmpireDocument> {
    if (dto.technologies) {
      await this.unlockTechnology(empire, dto.technologies);
    }
    if (dto.resources) {
      this.resourceTrading(empire, dto.resources);
    }
    await this.saveAll([empire]); // emits update event
    return empire;
  }

  private async unlockTechnology(empire: EmpireDocument, technologies: string[]) {
    const user = await this.userService.find(empire.user) ?? notFound(empire.user);
    const variables = {
      ...getVariables('technologies'),
      'empire.technologies.cost_multiplier': EMPIRE_VARIABLES.technologies.cost_multiplier,
    };
    calculateVariables(variables, empire);

    for (const technologyId of technologies) {
      const technology = TECHNOLOGIES[technologyId] ?? notFound(`Technology ${technologyId} not found.`);

      if (empire.technologies.includes(technologyId)) {
        throw new BadRequestException(`Technology ${technologyId} has already been unlocked.`);
      }

      // Check if all required technologies are unlocked
      const hasAllRequiredTechnologies = !technology.requires || technology.requires.every(
        (requiredTechnology: string) => empire.technologies.includes(requiredTechnology)
      );

      if (!hasAllRequiredTechnologies) {
        const missingTechnologies = findMissingTechnologies(technologyId);
        throw new BadRequestException(`Required technologies for ${technologyId}: ${missingTechnologies.join(', ')}.`);
      }

      // Calculate the technology cost based on the formula
      const technologyCost = this.getTechnologyCost(user, technology, variables);

      if (empire.resources.research < technologyCost) {
        throw new BadRequestException(`Not enough research points to unlock ${technologyId}.`);
      }

      // Deduct research points and unlock technology
      empire.resources.research -= technologyCost;
      empire.markModified('resources');
      if (!empire.technologies.includes(technologyId)) {
        empire.technologies.push(technologyId);
        // Increment the user's technology count by 1
        if (user.technologies) {
          user.technologies[technologyId] = (user.technologies?.[technologyId] ?? 0) + 1;
          user.markModified('technologies');
        }
      }
    }

    await this.userService.saveAll([user]);
  }

  private getTechnologyCost(user: UserDocument, technology: Technology, variables: Partial<Record<Variable, number>>) {
    const technologyCount = user.technologies?.[technology.id] || 0;

    let technologyCost = technology.cost;

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

  private resourceTrading(empire: Empire, resources: Record<ResourceName, number>) {
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
  }

  async initEmpires(game: Game): Promise<EmpireDocument[]> {
    const existingEmpires = await this.findAll({
      game: game._id,
    });
    if (existingEmpires.length) {
      return [];
    }

    const members = await this.memberService.findAll({
      game: game._id,
    });
    return this.createMany(members
      .filter(m => m.empire)
      .map(member => {
        const resourceVariables: Record<Variable & `resources.${string}`, number> = flatten(RESOURCES, 'resources.');
        calculateVariables(resourceVariables, {
          traits: member.empire!.traits,
          technologies: [],
        });
        const resources: any = {};
        for (const resource of RESOURCE_NAMES) {
          resources[resource] = resourceVariables[`resources.${resource}.starting`];
        }
        return ({
          ...member.empire!,
          game: game._id,
          user: member.user,
          technologies: [],
          resources,
        });
      })
    );
  }

  private async emit(event: string, empire: Empire) {
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, empire, [empire.user.toString()]);
    const otherMembers = await this.memberService.findAll({
      game: empire.game,
      user: {$ne: empire.user}
    }, {projection: {user: 1}});
    const maskedEmpire = this.mask(empire);
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, maskedEmpire, otherMembers.map(m => m.user.toString()));
  }
}
