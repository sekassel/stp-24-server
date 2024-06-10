import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {GameLogicService} from './game-logic.service';
import * as Sentry from "@sentry/node";

@Injectable()
export class GameLogicScheduler {
  private logger = new Logger(GameLogicScheduler.name);

  constructor(
    private gameLogicService: GameLogicService,
  ) {
  }

  // Games with speed 0 are not updated, aka paused

  @Cron(CronExpression.EVERY_MINUTE)
  async updateGames1() {
    return this.updateGames(1);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateGames2() {
    return this.updateGames(2);
  }

  @Cron("*/20 * * * * *") // every 20 seconds
  async updateGames3() {
    return this.updateGames(3);
  }

  private async updateGames(speed: number) {
    return this.gameLogicService.updateGames(speed).catch(err => {
      this.logger.error(err);
      Sentry.captureException(err);
    });
  }
}
