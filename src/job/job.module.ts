import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Job, JobSchema} from './job.schema';
import {JobController} from "./job.controller";
import {JobService} from "./job.service";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Job.name, schema: JobSchema}])
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {
}
