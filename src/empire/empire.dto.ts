import {ApiProperty, ApiPropertyOptional, OmitType, PickType} from '@nestjs/swagger';
import {Empire} from './empire.schema';
import {Prop} from '@nestjs/mongoose';
import {SYSTEM_TYPES, SystemTypeName} from '../game-logic/system-types';
import {IsIn, IsOptional} from 'class-validator';
import {PartialType} from '../util/partial-type';
import {RESOURCES_SCHEMA_PROPERTIES} from '../game-logic/types';

export class ReadEmpireDto extends OmitType(Empire, [
  'resources',
  'technologies',
  'traits',
  '_private',
] as const) {
}

export class EmpireTemplate extends PickType(Empire, [
  'name',
  'description',
  'color',
  'flag',
  'portrait',
  'traits',
  'effects',
  '_private',
  '_public',
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

export class UpdateEmpireDto extends PartialType(PickType(Empire, [
  'resources',
  'technologies',
  'effects',
  '_private',
  '_public',
] as const)) {
  @ApiPropertyOptional({
    ...RESOURCES_SCHEMA_PROPERTIES,
    description: 'Update resources for market trades. The credits are automatically updated as well.',
  })
  resources?: Record<string, number>;

  @ApiProperty({
    description: 'Unlock technologies. Only new technologies should be specified, not already unlocked ones.',
  })
  technologies?: string[];
}
