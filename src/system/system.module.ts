import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {GameModule} from '../game/game.module';
import {SystemController} from './system.controller';
import {SystemHandler} from './system.handler';
import {System, SystemSchema} from './system.schema';
import {SystemService} from './system.service';
import {EmpireModule} from '../empire/empire.module';
import {SystemGeneratorService} from "./systemgenerator.service";
import {ClusterGeneratorService} from "./clustergenerator.service";
import {MemberModule} from '../member/member.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: System.name,
      schema: SystemSchema,
    }]),
    GameModule,
    MemberModule,
    EmpireModule,
  ],
  controllers: [SystemController],
  providers: [SystemService, SystemGeneratorService, ClusterGeneratorService, SystemHandler],
  exports: [SystemService],
})
export class SystemModule {
}
