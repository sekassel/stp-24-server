import { Injectable } from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {GameLogicService} from './game-logic.service';

@Injectable()
export class GameLogicScheduler {
  constructor(
    private gameLogicService: GameLogicService,
  ) {
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateGames() {
    return this.gameLogicService.updateGames();
  }
}
