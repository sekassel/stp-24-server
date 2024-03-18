import {Module} from '@nestjs/common';
import {GameLogicService} from './game-logic.service';
import {environment} from '../environment';
import {GameLogicScheduler} from './game-logic.scheduler';
import {GameModule} from '../game/game.module';
import {SystemModule} from '../system/system.module';
import {EmpireModule} from '../empire/empire.module';
import {GameLogicController} from './game-logic.controller';
import {GameLogicHandler} from './game-logic.handler';

@Module({
  imports: [
    GameModule,
    SystemModule,
    EmpireModule,
  ],
  providers: environment.passive ? [GameLogicService, GameLogicHandler] : [GameLogicService, GameLogicHandler, GameLogicScheduler],
  controllers: [GameLogicController],
})
export class GameLogicModule {
}
