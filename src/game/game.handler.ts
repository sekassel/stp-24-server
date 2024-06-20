import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {User} from '../user/user.schema';
import {GameService} from './game.service';
import {Game} from './game.schema';

@Injectable()
export class GameHandler {
  constructor(
    private gameService: GameService,
  ) {
  }

  /**
   * When a game is created, pause all the other games owner by the same user.
   */
  @OnEvent('games.*.created')
  async onGameCreated(game: Game): Promise<void> {
    await this.gameService.updateMany({owner: game.owner}, {speed: 0});
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.gameService.deleteMany({owner: user._id});
  }
}
