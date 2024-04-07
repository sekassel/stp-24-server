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
  'description',
  'color',
  'flag',
  'homeSystem',
  'portrait',
  'traits',
] as const) {
}

export class UpdateEmpireDto extends PickType(Empire, [
  'resources',
  'technologies',
] as const) {
}
