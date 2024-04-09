import {ApiPropertyOptional, OmitType, PickType} from '@nestjs/swagger';
import {Empire} from './empire.schema';
import {Prop} from '@nestjs/mongoose';
import {SYSTEM_TYPES, SystemTypeName} from '../game-logic/system-types';
import {IsIn, IsOptional} from 'class-validator';

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
  'portrait',
  'traits',
] as const) {
  @Prop({type: String})
  @ApiPropertyOptional({
    description: 'The type of home system for this empire. Random if not specified.',
    enum: Object.keys(SYSTEM_TYPES),
  })
  @IsOptional()
  @IsIn(Object.keys(SYSTEM_TYPES))
  homeSystem?: SystemTypeName;
}

export class UpdateEmpireDto extends PickType(Empire, [
  'resources',
  'technologies',
] as const) {
}
