import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {OptionalRef, Ref} from '@mean-stream/nestx';
import {EffectSource} from "../game-logic/types";
import {SHIP_NAMES, SHIP_TYPES, ShipTypeName} from '../game-logic/ships';
import {Type} from 'class-transformer';

export type FleetDocument = Fleet & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Fleet extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @OptionalRef('Empire')
  @ApiPropertyOptional({description: 'Owner Empire ID, or undefined if not owned by anyone (wild fleets).'})
  empire?: Types.ObjectId;

  @Prop({required: true})
  @ApiProperty({description: 'Custom name of the fleet.'})
  @IsString()
  @IsNotEmpty()
  name: string;

  @Ref('System')
  @ApiProperty({description: 'ID of the system the fleet is currently stationed at.'})
  location: Types.ObjectId;

  @Prop({type: Object})
  @ApiProperty({
    description: 'Number of ships within this fleet if fully built.',
    example: {
      colonizer: 1,
      destroyer: 10,
    },
    type: 'object',
    additionalProperties: {
      type: 'integer',
      default: 0,
      minimum: 0,
    },
  })
  @IsObject()
  size: Partial<Record<ShipTypeName, number>>;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({
    description: 'Custom data, visible only to the owner empire.',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  _private?: Record<string, any>;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({
    description: 'Custom data, visible to everyone.',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  _public?: Record<string, any>;

  @Prop({type: [EffectSource], default: []})
  @ApiPropertyOptional({description: 'Custom effects.', type: [EffectSource]})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => EffectSource)
  effects?: EffectSource[];
}

export const FleetSchema = SchemaFactory.createForClass(Fleet);
