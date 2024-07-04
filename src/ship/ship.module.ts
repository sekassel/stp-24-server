import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ShipService} from "./ship.service";
import {ShipController} from "./ship.controller";
import {Ship, ShipSchema} from "./ship.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Ship.name, schema: ShipSchema}]),
  ],
  controllers: [ShipController],
  providers: [ShipService],
  exports: [ShipService],
})
export class ShipModule {
}
