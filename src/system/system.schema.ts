import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {BuildingName} from "../game-logic/buildings";
import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNumber, IsString, Max, Min} from "class-validator";

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class System extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsString()
  type: string;

  @Prop()
  @ApiProperty()
  buildingSlots: Partial<Record<BuildingName, number>>;

  @Prop()
  @ApiProperty()
  buildings: Partial<Record<BuildingName, number>>;

  @Prop()
  @ApiProperty()
  @IsInt()
  @Min(0)
  capacity: number;

  @Prop()
  @ApiProperty({
    type: 'integer',
    minimum: 0,
    maximum: 2,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  upgrade: number;

  @Prop()
  @ApiProperty()
  links: Record<string, number>;

  @Prop()
  @ApiProperty()
  @IsNumber()
  x: number;

  @Prop()
  @ApiProperty()
  @IsNumber()
  y: number;

  @OptionalRef('Empire')
  owner?: Types.ObjectId;
}

export type SystemDocument = Doc<System>;

export const SystemSchema = SchemaFactory.createForClass(System);
