import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Job, JobSchema} from './job.schema';
import {JobsController} from "./job.controller";
import {JobsService} from "./job.service";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Job.name, schema: JobSchema}])
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobModule {}
