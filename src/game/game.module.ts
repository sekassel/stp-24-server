import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {environment} from '../environment';
import {GameController} from './game.controller';
import {GameHandler} from './game.handler';
import {GameScheduler} from './game.scheduler';
import {Game, GameSchema} from './game.schema';
import {GameService} from './game.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Game.name,
      schema: GameSchema,
    }]),
  ],
  controllers: [GameController],
  providers: [
    GameService,
    GameHandler,
    ...(environment.passive ? [] : [GameScheduler]),
  ],
  exports: [GameService],
})
export class GameModule {
}
