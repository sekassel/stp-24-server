import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {User} from '../user/user.schema';
import {MemberService} from './member.service';

@Injectable()
export class MemberHandler {
  constructor(
    private memberService: MemberService,
  ) {
  }

  @OnEvent('games.*.created')
  async onGameCreated(game: Game): Promise<void> {
    await this.memberService.create({
      game: game._id,
      user: game.owner,
      ready: false,
    });
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.memberService.deleteMany({
      game: game._id,
    });
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.memberService.deleteMany({
      user: user._id,
    });
  }
}
