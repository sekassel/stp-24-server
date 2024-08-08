import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';

import {Game} from '../game/game.schema';
import {CreateMemberDto} from './member.dto';
import {Member, MemberDocument} from './member.schema';

@Injectable()
@EventRepository()
export class MemberService extends MongooseRepository<Member, never, MemberDocument> {
  constructor(
    @InjectModel(Member.name) model: Model<Member>,
    private eventEmitter: EventService,
  ) {
    super(model as any);
  }

  async checkPassword(game: Game, member: CreateMemberDto): Promise<boolean> {
    return bcrypt.compare(member.password, game.passwordHash);
  }

  private emit(event: string, member: Member): void {
    this.eventEmitter.emit(`games.${member.game}.members.${member.user}.${event}`, member);
  }
}
