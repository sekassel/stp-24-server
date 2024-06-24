import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {GameModule} from '../game/game.module';
import {EmpireController} from './empire.controller';
import {EmpireHandler} from './empire.handler';
import {Empire, EmpireSchema} from './empire.schema';
import {EmpireService} from './empire.service';
import {MemberModule} from '../member/member.module';
import {UserModule} from '../user/user.module';
import {EmpireLogicService} from './empire-logic.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Empire.name,
      schema: EmpireSchema,
    }]),
    GameModule,
    MemberModule,
    UserModule,
  ],
  controllers: [EmpireController],
  providers: [EmpireService, EmpireHandler, EmpireLogicService],
  exports: [EmpireService, EmpireLogicService],
})
export class EmpireModule {
}
