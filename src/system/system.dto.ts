import {PickType} from '@nestjs/swagger';
import {System} from './system.schema';

export class UpdateSystemDto extends PickType(System, [
  'upgrade',
  'owner',
  'buildings',
] as const) {
}
