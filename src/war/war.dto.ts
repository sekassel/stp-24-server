import {War} from "./war.schema";
import {PartialType, PickType} from "@nestjs/swagger";

export class CreateWarDto extends PickType(War, [
  'attacker',
  'defender',
  'name',
  '_public',
] as const) {}

export class UpdateWarDto extends PartialType(
  PickType(War, [
    'name',
    '_public'
  ] as const),
) {}
