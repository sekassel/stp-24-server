import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {SystemService} from './system.service';
import {Empire} from '../empire/empire.schema';
import {SystemLogicService} from './system-logic.service';

@Injectable()
export class SystemHandler {
  constructor(
    private systemService: SystemService,
    private systemLogicService: SystemLogicService,
  ) {
  }

  @OnEvent('games.*.empires.*.created')
  async onEmpireCreated(empire: Empire): Promise<void> {
    if (empire.homeSystem) {
      // This means the empire was created later in the game.
      // Regular empires are created with homeSystem:undefined and initialised by GameLogicService.
      const system = await this.systemService.find(empire.homeSystem);
      if (!system) {
        return;
      }

      this.systemLogicService.initHomeSystem(system, empire);
      await this.systemService.saveAll([system]);
    }
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.systemService.deleteMany({
      game: game._id,
    });
  }
}
