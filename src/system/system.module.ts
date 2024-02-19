import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {GameModule} from '../game/game.module';
import {SystemController} from './system.controller';
import {SystemHandler} from './system.handler';
import {System, SystemSchema} from './system.schema';
import {SystemService} from './system.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: System.name,
      schema: SystemSchema,
    }]),
    GameModule,
  ],
  controllers: [SystemController],
  providers: [SystemService, SystemHandler],
  exports: [SystemService],
})
export class SystemModule {
}
