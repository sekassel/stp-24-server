import {PickType} from '@nestjs/swagger';
import {Job} from "./job.schema";

export class CreateJobDto extends PickType(Job, ['system', 'type', 'building', 'district', 'technology'] as const) {
}
