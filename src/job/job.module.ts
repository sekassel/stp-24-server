import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Job, JobSchema} from './job.schema';
import {JobController} from './job.controller';
import {JobService} from './job.service';
import {EmpireModule} from '../empire/empire.module';
import {JobHandler} from './job.handler';
import {SystemModule} from '../system/system.module';
import {UserModule} from '../user/user.module';
import {JobLogicService} from './job-logic.service';
import {MemberModule} from '../member/member.module';
import {FleetModule} from "../fleet/fleet.module";
import {ShipModule} from "../ship/ship.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Job.name, schema: JobSchema}]),
    UserModule,
    EmpireModule,
    SystemModule,
    MemberModule,
    FleetModule,
    ShipModule,
  ],
  controllers: [JobController],
  providers: [JobService, JobHandler, JobLogicService],
  exports: [JobService],
})
export class JobModule {
}
