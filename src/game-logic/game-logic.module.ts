import {forwardRef, Module} from '@nestjs/common';
import {GameLogicService} from './game-logic.service';
import {SystemModule} from '../system/system.module';
import {EmpireModule} from '../empire/empire.module';
import {GameLogicController} from './game-logic.controller';
import {MemberModule} from '../member/member.module';
import {JobModule} from '../job/job.module';
import {AggregateService} from './aggregate.service';
import {FleetModule} from '../fleet/fleet.module';
import {ShipModule} from '../ship/ship.module';

@Module({
  imports: [
    forwardRef(() => require('../game/game.module').GameModule),
    MemberModule,
    SystemModule,
    EmpireModule,
    JobModule,
    FleetModule,
    ShipModule,
  ],
  providers: [GameLogicService, AggregateService],
  exports: [GameLogicService],
  controllers: [GameLogicController],
})
export class GameLogicModule {
}
