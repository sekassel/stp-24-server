import {OmitType, PickType} from "@nestjs/swagger";
import {Fleet} from "./fleet.schema";
import {PartialType} from '../util/partial-type';

export class CreateFleetDto extends OmitType(Fleet, [
  '_id',
  'game',
  'empire',
  'createdAt',
  'updatedAt',
] as const) {}

export class ReadFleetDto extends OmitType(Fleet, [
  '_private',
  'effects',
] as const) {}

export class UpdateFleetDto extends PartialType(PickType(Fleet, [
  'name',
  'size',
  '_private',
  '_public',
  'effects',
] as const)) {}
