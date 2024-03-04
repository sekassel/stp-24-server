import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository, notFound} from '@mean-stream/nestx';
import {Empire, EmpireDocument} from './empire.schema';
import {EmpireTemplate, ReadEmpireDto} from './empire.dto';
import {MemberService} from '../member/member.service';
import {COLOR_PALETTE, EMPIRE_PREFIX_PALETTE, EMPIRE_SUFFIX_PALETTE, MAX_EMPIRES} from '../game-logic/constants';
import {generateTraits} from '../game-logic/traits';
import {TECHNOLOGIES} from "../game-logic/technologies";
import {UserService} from "../user/user.service";
import {UpdateUserDto} from "../user/user.dto";

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

  async unlockTechnology(empire: Empire, technologies: string[]) {
    for (const technologyId of technologies) {
      const technology = TECHNOLOGIES[technologyId] ?? notFound(`Technology ${technologyId} not found.`);

      // Check if all required technologies are unlocked
      const hasAllRequiredTechnologies = !technology.requires || technology.requires.every(
        (requiredTechnology: string) => empire.technologies.includes(requiredTechnology)
      );

      if (!hasAllRequiredTechnologies) {
        const missingTechnologies = findMissingTechnologies(technologyId);
        throw new BadRequestException(`Required technologies for ${technologyId}: ${missingTechnologies.join(', ')}.`);
      }

      // Calculate the technology cost based on the formula
      const user = await this.userService.find(empire.user) ?? notFound(empire.user);
      const technologyCount = user.technologies?.[technologyId] || 0;
      const technologyCost = technology.cost * 0.95 ** Math.min(technologyCount, 10);

      if (empire.resources.research < technologyCost) {
        throw new BadRequestException(`Not enough research points to unlock ${technologyId}.`);
      }

      // Deduct research points and unlock technology
      empire.resources.research -= technologyCost;
      if (!empire.technologies.includes(technologyId)) {
        empire.technologies.push(technologyId);
        // Increment the user's technology count by 1
        await this.userService.update(user._id, {
          $inc: {[`technologies.${technologyId}`]: 1}
        } as UpdateUserDto);
      }
    }
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
