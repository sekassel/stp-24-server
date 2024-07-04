import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {War, WarSchema} from "./war.schema";
import {WarService} from "./war.service";
import {WarController} from "./war.controller";
import {EmpireModule} from "../empire/empire.module";
import {WarHandler} from "./war.handler";

@Module({
  imports: [
    MongooseModule.forFeature([{name: War.name, schema: WarSchema}]),
    EmpireModule,
  ],
  controllers: [WarController],
  providers: [WarService, WarHandler],
  exports: [WarService],
})
export class WarModule {
}
