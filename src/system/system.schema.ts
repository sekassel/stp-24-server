import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {BuildingName, BUILDINGS} from "../game-logic/buildings";
import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNumber, IsObject, IsString, Max, Min} from "class-validator";

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class System extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsString()
  type: string;

  @Prop({type: Object, default: {}})
  @IsObject()
  @ApiProperty({
    description: 'The number of slots of some building types.',
    example: {
      'power_plant': 5,
      'mine': 6,
      'farm': 5,
      'research_lab': 4,
    },
    type: 'object',
    properties: Object.fromEntries(Object.keys(BUILDINGS).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
      required: false,
    }])) as any,
  })
  buildingSlots: Partial<Record<BuildingName, number>>;

  @Prop({type: Object, default: {}})
  @IsObject()
  @ApiProperty({
    description: 'The number of existing buildings.',
    example: {
      'power_plant': 2,
      'mine': 3,
      'farm': 1
    },
    type: 'object',
    properties: Object.fromEntries(Object.keys(BUILDINGS).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
      required: false,
    }])) as any,
  })
  buildings: Partial<Record<BuildingName, number>>;

  @Prop()
  @ApiProperty({
    description: 'Total building capacity of the system.',
  })
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

  @Prop({type: Object})
  @ApiProperty({
    description: 'Distance to other systems that are connected to this one.',
    example: {
      '507f191e810c19729de860ea': 3,
      '617f191e810a19729de860eb': 5,
    },
    type: 'object',
  })
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
