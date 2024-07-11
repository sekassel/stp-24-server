import {OmitType, PickType} from "@nestjs/swagger";
import {Fleet} from "./fleet.schema";

export class CreateFleetDto extends OmitType(Fleet, [
  '_id',
  'game',
  'empire',
] as const) {}

export class ReadFleetDto extends OmitType(Fleet, [
  '_private',
  'effects',
] as const) {}

export class UpdateFleetDto extends PickType(Fleet, [
  'name',
  'size',
  '_private',
  '_public',
  'effects',
] as const) {}
