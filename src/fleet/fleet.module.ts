import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {FleetService} from "./fleet.service";
import {FleetHandler} from "./fleet.handler";
import {Fleet, FleetSchema} from "./fleet.schema";
import {FleetController} from "./fleet.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Fleet.name, schema: FleetSchema}]),
  ],
  controllers: [FleetController],
  providers: [FleetService, FleetHandler],
  exports: [FleetService],
})
export class FleetModule {
}
