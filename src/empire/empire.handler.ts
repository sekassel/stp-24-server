import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {EmpireService} from './empire.service';
import {User} from '../user/user.schema';
import {MemberService} from '../member/member.service';
import {calculateVariables, flatten} from '../game-logic/variables';
import {RESOURCE_NAMES, RESOURCES} from '../game-logic/resources';
import {Variable} from '../game-logic/types';

@Injectable()
export class EmpireHandler {
  constructor(
    private empireService: EmpireService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.empireService.deleteMany({
      game: game._id,
    });
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.empireService.deleteMany({
      user: user._id,
    });
  }
}
