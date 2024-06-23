import {PickType} from '@nestjs/swagger';
import {Job} from "./job.schema";

export class CreateJobDto extends PickType(Job, [
  'priority',
  'system',
  'type',
  'building',
  'district',
  'technology',
] as const) {
}
