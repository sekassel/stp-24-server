import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BUILDING_NAMES, BuildingName} from "../game-logic/buildings";
import {DISTRICT_NAMES, DistrictName} from "../game-logic/districts";
import {RESOURCES_SCHEMA_PROPERTIES, TECHNOLOGY_TAGS, TechnologyTag} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsEnum, IsIn, IsNumber, IsOptional} from 'class-validator';
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

  @Prop({required: true, enum: JobType})
  @ApiProperty({enum: JobType, description: 'Type of the job'})
  @IsEnum(JobType)
  type: string;

  @Prop({type: String})
  @IsOptional()
  @ApiPropertyOptional({required: false, description: 'Building name for the job'})
  @IsIn(BUILDING_NAMES)
  building?: BuildingName;

  @Prop({type: String})
  @IsOptional()
  @ApiPropertyOptional({required: false, description: 'District name for the job'})
  @IsIn(DISTRICT_NAMES)
  district?: DistrictName;

  @Prop({type: String})
  @IsOptional()
  @ApiPropertyOptional({required: false, description: 'Technology name for the job'})
  @IsIn(TECHNOLOGY_TAGS)
  technology?: TechnologyTag;

  @Prop({type: Map, of: Number, default: {}})
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Initial cost of resources for the job',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  cost?: Record<ResourceName, number>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
