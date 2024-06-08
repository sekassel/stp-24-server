import {PickType} from '@nestjs/swagger';
import {Job} from "./job.schema";

export enum JobType {
  BUILDING = 'building',
  DISTRICT = 'district',
  UPGRADE = 'upgrade',
  TECHNOLOGY = 'technology',
}

export class CreateJobDto extends PickType(Job, ['system', 'type', 'building', 'district', 'technology'] as const) {
}
