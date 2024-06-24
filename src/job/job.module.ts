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

@Module({
  imports: [
    MongooseModule.forFeature([{name: Job.name, schema: JobSchema}]),
    UserModule,
    EmpireModule,
    SystemModule,
  ],
  controllers: [JobController],
  providers: [JobService, JobHandler, JobLogicService],
  exports: [JobService],
})
export class JobModule {
}
