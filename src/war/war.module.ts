import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {War, WarSchema} from "./war.schema";
import {WarService} from "./war.service";
import {WarController} from "./war.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: War.name, schema: WarSchema }])
  ],
  controllers: [WarController],
  providers: [WarService],
  exports: [WarService],
})
export class WarModule {}
