import { Injectable } from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {GameLogicService} from './game-logic.service';

@Injectable()
export class GameLogicScheduler {
  constructor(
    private gameLogicService: GameLogicService,
  ) {
  }

  // Games with speed 0 are not updated, aka paused

  @Cron("*/15 * * * * *") // Every 15 seconds
  async updateGames1() {
    return this.gameLogicService.updateGames(1);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateGames2() {
    return this.gameLogicService.updateGames(2);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateGames4() {
    return this.gameLogicService.updateGames(4);
  }
}
