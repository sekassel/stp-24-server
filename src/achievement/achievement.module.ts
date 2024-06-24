import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {UserModule} from '../user/user.module';
import {AchievementController} from './achievement.controller';
import {AchievementHandler} from './achievement.handler';
import {Achievement, AchievementSchema} from './achievement.schema';
import {AchievementService} from './achievement.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Achievement.name,
      schema: AchievementSchema,
    }]),
    UserModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementHandler],
  exports: [AchievementService],
})
export class AchievementModule {
}
