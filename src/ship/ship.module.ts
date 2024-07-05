import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ShipService} from "./ship.service";
import {ShipController} from "./ship.controller";
import {Ship, ShipSchema} from "./ship.schema";
import {EmpireModule} from "../empire/empire.module";
import {FleetModule} from "../fleet/fleet.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Ship.name, schema: ShipSchema}]),
    EmpireModule,
    FleetModule,
  ],
  controllers: [ShipController],
  providers: [ShipService],
  exports: [ShipService],
})
export class ShipModule {
}
