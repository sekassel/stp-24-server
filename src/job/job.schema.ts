import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';
import {DISTRICT_NAMES, DistrictName} from '../game-logic/districts';
import {RESOURCES_SCHEMA_PROPERTIES} from '../game-logic/types';
import {ResourceName} from '../game-logic/resources';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsEnum, IsIn, IsNumber, IsObject, IsOptional, ValidateIf} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {AsObjectId, Ref} from '@mean-stream/nestx';
import {JobType} from './job-type.enum';
import {TECHNOLOGY_IDS} from '../game-logic/technologies';

export type JobDocument = Job & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Job extends GlobalSchema {
  @Prop({required: true})
  @ApiProperty({description: 'Current progress of the job'})
  @IsNumber()
  progress: number;

  @Prop({required: true})
  @ApiProperty({description: 'Total progress steps required for the job'})
  @IsNumber()
  total: number;

  @Ref('Game')
  game: Types.ObjectId;

  @Ref('Empire')
  empire: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'System', required: false})
  @ApiPropertyOptional({description: 'System ID for the job. Required for type=building, type=district, type=upgrade.'})
  @ValidateIf((job, value) => value || job.type === JobType.BUILDING || job.type === JobType.DISTRICT || job.type === JobType.UPGRADE)
  @AsObjectId()
  system?: Types.ObjectId;

  @Prop({required: true, type: String, enum: JobType})
  @ApiProperty({enum: JobType, description: 'Type of the job'})
  @IsEnum(JobType)
  type: JobType;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: BUILDING_NAMES,
    description: 'Building name for the job. Required for type=building.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.BUILDING)
  @IsIn(BUILDING_NAMES)
  building?: BuildingName;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: DISTRICT_NAMES,
    description: 'District name for the job. Required for type=district.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.DISTRICT)
  @IsIn(DISTRICT_NAMES)
  district?: DistrictName;

  @Prop({type: String})
  @ApiPropertyOptional({
    example: 'improved_production_1',
    enum: TECHNOLOGY_IDS,
    description: 'Technology name for the job. Required for type=technology.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.TECHNOLOGY)
  @IsIn(TECHNOLOGY_IDS)
  technology?: string;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({
    description: 'Initial cost of resources for the job',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  @IsOptional()
  @IsObject()
  cost?: Partial<Record<ResourceName, number>>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
