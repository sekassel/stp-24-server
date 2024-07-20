import {OmitType, PickType} from '@nestjs/swagger';
import {Ship} from './ship.schema';

export class ReadShipDto extends OmitType(Ship, [
  'health',
  '_private',
] as const) {}

export class UpdateShipDto extends PickType(Ship, [
  'fleet',
  '_private',
  '_public',
] as const) {}
