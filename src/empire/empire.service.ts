import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {Empire, EmpireDocument} from './empire.schema';
import {EmpireTemplate, ReadEmpireDto, UpdateEmpireDto} from './empire.dto';
import {MemberService} from '../member/member.service';
import {COLOR_PALETTE, EMPIRE_PREFIX_PALETTE, EMPIRE_SUFFIX_PALETTE, MIN_EMPIRES} from '../game-logic/constants';
import {generateTraits} from '../game-logic/traits';
import {Member} from '../member/member.schema';
import {EmpireLogicService} from './empire-logic.service';

@Injectable()
@EventRepository()
export class EmpireService extends MongooseRepository<Empire> {
  constructor(
    @InjectModel(Empire.name) model: Model<Empire>,
    private eventEmitter: EventService,
    private memberService: MemberService,
    private empireLogicService: EmpireLogicService,
  ) {
    super(model);
  }

  generateTemplate(): EmpireTemplate {
    return {
      name: EMPIRE_PREFIX_PALETTE.random() + ' ' + EMPIRE_SUFFIX_PALETTE.random(),
      color: COLOR_PALETTE.random(),
      flag: Math.randInt(MIN_EMPIRES),
      portrait: Math.randInt(MIN_EMPIRES),
      traits: generateTraits(),
    };
  }

  mask(empire: Empire | EmpireDocument): ReadEmpireDto {
    if (empire instanceof Document) {
      empire = empire.toObject();
    }
    const {resources, technologies, traits, _private, ...rest} = empire;
    return rest;
  }

  updateEmpire(empire: EmpireDocument, dto: UpdateEmpireDto) {
    const {resources, ...rest} = dto;
    empire.set(rest);
    if (resources) {
      this.empireLogicService.tradeResources(empire, resources);
    }
  }

  async initEmpires(members: Member[]): Promise<EmpireDocument[]> {
    return this.createMany(members.filter(m => m.empire).map(member => {
      return ({
        ...member.empire!,
        game: member.game,
        user: member.user,
        technologies: [],
        resources: this.empireLogicService.getInitialResources(member.empire!),
        homeSystem: undefined, // set in a later stage of game initialization
      });
    }));
  }

  private async emit(event: string, empire: Empire) {
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, empire, [empire.user.toString()]);
    const otherMembers = await this.memberService.findAll({
      game: empire.game,
      user: {$ne: empire.user},
    }, {projection: {user: 1}});
    const maskedEmpire = this.mask(empire);
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, maskedEmpire, otherMembers.map(m => m.user.toString()));
  }
}
