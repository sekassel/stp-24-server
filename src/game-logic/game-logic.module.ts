import {Module} from '@nestjs/common';
import {GameLogicService} from './game-logic.service';
import {environment} from '../environment';
import {GameLogicScheduler} from './game-logic.scheduler';
import {GameModule} from '../game/game.module';
import {SystemModule} from '../system/system.module';
import {EmpireModule} from '../empire/empire.module';

@Module({
  imports: [
    GameModule,
    SystemModule,
    EmpireModule,
  ],
  providers: environment.passive ? [GameLogicService] : [GameLogicService, GameLogicScheduler],
})
export class GameLogicModule {
}
