import {PickType} from '@nestjs/swagger';
import {Job} from "./job.schema";
import {PartialType} from '../util/partial-type';

export class CreateJobDto extends PickType(Job, [
  'priority',
  'system',
  'type',
  'building',
  'district',
  'technology',
] as const) {
}

export class UpdateJobDto extends PartialType(PickType(Job, [
  'priority',
] as const)) {
}
