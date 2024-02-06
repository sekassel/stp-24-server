import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {Empire, EmpireDocument} from './empire.schema';
import {ReadEmpireDto} from './empire.dto';
import {MemberService} from '../member/member.service';

@Injectable()
@EventRepository()
export class EmpireService extends MongooseRepository<Empire> {
  constructor(
    @InjectModel(Empire.name) model: Model<Empire>,
    private eventEmitter: EventService,
    private memberService: MemberService,
  ) {
    super(model);
  }

  mask(empire: Empire | EmpireDocument): ReadEmpireDto {
    if (empire instanceof Document) {
      empire = empire.toObject();
    }
    const {resources, technologies, traits, ...rest} = empire;
    return rest;
  }

  private async emit(event: string, empire: Empire) {
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, empire, [empire.user.toString()]);
    const otherMembers = await this.memberService.findAll({game: empire.game, user: {$ne: empire.user}}, {projection: {user: 1}});
    const maskedEmpire = this.mask(empire);
    this.eventEmitter.emit(`games.${empire.game}.empires.${empire._id}.${event}`, maskedEmpire, otherMembers.map(m => m.user.toString()));
  }
}
