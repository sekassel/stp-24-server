import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {FleetService} from './fleet.service';
import {FleetHandler} from './fleet.handler';
import {Fleet, FleetSchema} from './fleet.schema';
import {FleetController} from './fleet.controller';
import {EmpireModule} from '../empire/empire.module';
import {SystemModule} from '../system/system.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Fleet.name, schema: FleetSchema}]),
    EmpireModule,
    SystemModule,
  ],
  controllers: [FleetController],
  providers: [FleetService, FleetHandler],
  exports: [FleetService],
})
export class FleetModule {
}
