import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BUILDING_NAMES, BuildingName} from "../game-logic/buildings";
import {DISTRICT_NAMES, DistrictName} from "../game-logic/districts";
import {TECHNOLOGY_TAGS, TechnologyTag} from "../game-logic/types";
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
  @ApiProperty()
  game: Types.ObjectId;

  @Ref('Empire')
  @ApiProperty()
  empire: Types.ObjectId;

  @OptionalRef('System')
  @IsOptional()
  @ApiProperty({required: false})
  system?: Types.ObjectId;

  @Prop({required: true, enum: JobType})
  @ApiProperty({enum: JobType, description: 'Type of the job'})
  @IsEnum(JobType)
  type: string;

  @Prop({type: String})
  @IsOptional()
  @ApiProperty({required: false})
  @IsIn(Object.values(BUILDING_NAMES))
  building?: BuildingName;

  @Prop({type: String})
  @IsOptional()
  @ApiProperty({required: false})
  @IsIn(Object.values(DISTRICT_NAMES))
  district?: DistrictName;

  @Prop({type: String})
  @IsOptional()
  @ApiPropertyOptional({required: false})
  @IsIn(Object.values(TECHNOLOGY_TAGS))
  technology?: TechnologyTag;

  @Prop({type: Map, of: Number, default: {}})
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Initial cost of resources for the job',
    type: 'object',
    additionalProperties: {type: 'number'},
    required: false
  })
  cost?: Record<ResourceName, number>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
