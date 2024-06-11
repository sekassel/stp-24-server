import {forwardRef, Module} from '@nestjs/common';
import {GameLogicService} from './game-logic.service';
import {SystemModule} from '../system/system.module';
import {EmpireModule} from '../empire/empire.module';
import {GameLogicController} from './game-logic.controller';
import {MemberModule} from '../member/member.module';

@Module({
  imports: [
    forwardRef(() => require('../game/game.module').GameModule),
    MemberModule,
    SystemModule,
    EmpireModule,
  ],
  providers: [GameLogicService],
  exports: [GameLogicService],
  controllers: [GameLogicController],
})
export class GameLogicModule {
}
