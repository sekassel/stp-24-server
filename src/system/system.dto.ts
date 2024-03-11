import {PartialType, PickType} from '@nestjs/swagger';
import {System} from './system.schema';

export class UpdateSystemDto extends PartialType(PickType(System, [
  'upgrade',
  'owner',
  'districts',
  'buildings',
] as const)) {
}
