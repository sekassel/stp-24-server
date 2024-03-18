import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {SystemService} from './system.service';

@Injectable()
export class SystemHandler {
  constructor(
    private systemService: SystemService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.systemService.deleteMany({
      game: game._id,
    });
  }
}
