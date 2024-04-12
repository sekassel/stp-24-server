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

  @Cron(CronExpression.EVERY_MINUTE)
  async updateGames1() {
    return this.gameLogicService.updateGames(1);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateGames2() {
    return this.gameLogicService.updateGames(2);
  }

  @Cron("*/20 * * * * *") // every 20 seconds
  async updateGames3() {
    return this.gameLogicService.updateGames(3);
  }
}
