import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BuildingName} from "../game-logic/buildings";
import {DistrictName} from "../game-logic/districts";
import {Building, District, Technology, TechnologyTag} from "../game-logic/types";
import {ResourceName} from "../game-logic/resources";
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsIn, IsNumber, IsOptional} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

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

  @Prop({type: Types.ObjectId, required: true})
  @ApiProperty()
  game: Types.ObjectId;

  @Prop({type: Types.ObjectId, required: true})
  @ApiProperty()
  empire: Types.ObjectId;

  @Prop({type: Types.ObjectId})
  @IsOptional()
  @ApiProperty({required: false})
  system?: Types.ObjectId;

  @Prop({required: true, enum: ['building', 'district', 'upgrade', 'technology']})
  @ApiProperty({enum: ['building', 'district', 'upgrade', 'technology'], description: 'Type of the job'})
  @IsIn(['building', 'district', 'upgrade', 'technology'])
  type: string;

  @Prop({type: Building})
  @IsOptional()
  @ApiProperty({required: false})
  building?: BuildingName;

  @Prop({type: District})
  @IsOptional()
  @ApiProperty({required: false})
  district?: DistrictName;

  @Prop({type: Technology})
  @IsOptional()
  @ApiProperty({required: false})
  technology?: TechnologyTag;

  @Prop({type: Map, of: Number, default: {}})
  @IsOptional()
  @ApiProperty({
    description: 'Initial cost of resources for the job',
    type: 'object',
    additionalProperties: {type: 'number'},
    required: false
  })
  cost?: Record<ResourceName, number>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
