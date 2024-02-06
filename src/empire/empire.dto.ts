import {OmitType, PickType} from '@nestjs/swagger';
import {Empire} from './empire.schema';

export class ReadEmpireDto extends OmitType(Empire, [
  'resources',
  'technologies',
  'traits',
] as const) {
}

export class EmpireTemplate extends PickType(Empire, [
  'name',
  'color',
  'flag',
  'portrait',
  'traits',
] as const) {
}

export class UpdateEmpireDto extends PickType(Empire, [
  'resources',
  'technologies',
] as const) {
}
