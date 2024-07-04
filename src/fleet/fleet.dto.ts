import {OmitType, PickType} from "@nestjs/swagger";
import {Fleet} from "./fleet.schema";
import {Ship} from "../game-logic/types";

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

export class ReadShipDto extends OmitType(Ship, [
  'health',
  '_private',
] as const) {}

export class UpdateShipDto extends PickType(Ship, [
  'fleet',
  '_private',
  '_public',
] as const) {}
