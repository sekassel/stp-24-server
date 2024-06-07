import {PickType} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {IsIn, IsOptional} from 'class-validator';
import {BuildingName} from "../game-logic/buildings";
import {DistrictName} from "../game-logic/districts";
import {TechnologyTag} from "../game-logic/types";
import {ApiPropertyOptional} from '@nestjs/swagger';
import {Job} from "./job.schema";

export class CreateJobDto extends PickType(Job, ['system', 'type', 'building', 'district', 'technology'] as const) {
  @ApiPropertyOptional({type: String, required: false})
  @IsOptional()
  system?: Types.ObjectId;

  @ApiPropertyOptional({enum: ['building', 'district', 'upgrade', 'technology'], description: 'Type of the job'})
  @IsIn(['building', 'district', 'upgrade', 'technology'])
  type: string;

  @ApiPropertyOptional({type: String, required: false})
  @IsOptional()
  building?: BuildingName;

  @ApiPropertyOptional({type: String, required: false})
  @IsOptional()
  district?: DistrictName;

  @ApiPropertyOptional({type: String, required: false})
  @IsOptional()
  technology?: TechnologyTag;
}
