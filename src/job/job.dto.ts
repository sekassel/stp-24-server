import {PickType} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {IsEnum, IsOptional} from 'class-validator';
import {BuildingName} from "../game-logic/buildings";
import {DistrictName} from "../game-logic/districts";
import {Building, District, Technology, TechnologyTag} from "../game-logic/types";
import {ApiPropertyOptional} from '@nestjs/swagger';
import {Job} from "./job.schema";
import {System} from "../system/system.schema";

export class CreateJobDto extends PickType(Job, ['system', 'type', 'building', 'district', 'technology'] as const) {
  @ApiPropertyOptional({type: System, required: false})
  @IsOptional()
  system?: Types.ObjectId;

  @ApiPropertyOptional({enum: ['building', 'district', 'upgrade', 'technology'], description: 'Type of the job'})
  @IsEnum(['building', 'district', 'upgrade', 'technology'])
  type: string;

  @ApiPropertyOptional({type: Building, required: false})
  @IsOptional()
  building?: BuildingName;

  @ApiPropertyOptional({type: District, required: false})
  @IsOptional()
  district?: DistrictName;

  @ApiPropertyOptional({type: Technology, required: false})
  @IsOptional()
  technology?: TechnologyTag;
}
