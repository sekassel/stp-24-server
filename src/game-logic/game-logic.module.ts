import {Module} from '@nestjs/common';
import {GameLogicService} from './game-logic.service';
import {GameModule} from '../game/game.module';
import {SystemModule} from '../system/system.module';
import {EmpireModule} from '../empire/empire.module';
import {GameLogicController} from './game-logic.controller';
import {GameLogicHandler} from './game-logic.handler';
import {MemberModule} from '../member/member.module';

@Module({
  imports: [
    GameModule,
    MemberModule,
    SystemModule,
    EmpireModule,
  ],
  providers: [GameLogicService, GameLogicHandler],
  controllers: [GameLogicController],
})
export class GameLogicModule {
}
