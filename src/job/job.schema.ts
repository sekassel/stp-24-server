import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BUILDING_NAMES, BuildingName} from "../game-logic/buildings";
import {DISTRICT_NAMES, DistrictName} from "../game-logic/districts";
import {RESOURCES_SCHEMA_PROPERTIES, TECHNOLOGY_TAGS, TechnologyTag} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsEnum, IsIn, IsNumber, IsObject, IsOptional} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {OptionalRef, Ref} from "@mean-stream/nestx";
import {JobType} from "./job-type.enum";

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

  @OptionalRef('System')
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
  @IsOptional()
  @IsIn(BUILDING_NAMES)
  building?: BuildingName;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: DISTRICT_NAMES,
    description: 'District name for the job. Required for type=district.',
  })
  @IsOptional()
  @IsIn(DISTRICT_NAMES)
  district?: DistrictName;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: TECHNOLOGY_TAGS,
    description: 'Technology name for the job. Required for type=technology.',
  })
  @IsOptional()
  @IsIn(TECHNOLOGY_TAGS)
  technology?: TechnologyTag;

  @Prop({type: Map, of: Number, default: {}})
  @ApiPropertyOptional({
    description: 'Initial cost of resources for the job',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  @IsOptional()
  @IsObject()
  cost?: Record<ResourceName, number>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
