import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { UserService } from './user.service';

@Injectable()
export class UserScheduler {
  private logger = new Logger('User Cleaner');

  constructor(
    private userService: UserService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteTempUsers() {
    const maxAgeMs = environment.cleanup.tempUserLifetimeHours * 60 * 60 * 1000;
    const users = await this.userService.deleteMany({
      createdAt: { $lt: new Date(Date.now() - maxAgeMs) },
      name: environment.cleanup.tempUserNamePattern,
    });
    if (users.deletedCount) {
      this.logger.warn(`Deleted ${users.deletedCount} temporary users.`);
    }
  }
}
