import {PartialType, PickType} from '@nestjs/swagger';
import {System} from './system.schema';

export class UpdateSystemDto extends PartialType(PickType(System, [
  'name',
  'upgrade',
  'owner',
  'districts',
  'buildings',
  '_public',
] as const)) {
}
