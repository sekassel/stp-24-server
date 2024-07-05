import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsObject, IsOptional, IsString, ValidateNested} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {AsObjectId, Ref} from '@mean-stream/nestx';
import {EffectSource} from "../game-logic/types";
import {ShipTypeName} from "../game-logic/ships";

export type FleetDocument = Fleet & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Fleet extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Ref('Empire')
  @ApiPropertyOptional({description: 'Owner Empire ID, or undefined if not owned by anyone (wild fleets).'})
  @AsObjectId()
  @IsOptional()
  empire?: Types.ObjectId;

  @Prop({required: true})
  @ApiProperty({description: 'Custom name of the fleet.'})
  @IsString()
  name: string;

  @Prop({required: true})
  @ApiProperty({description: 'ID of the system the fleet is currently stationed at.'})
  @AsObjectId()
  location: Types.ObjectId;

  @Prop({type: Map, of: Number})
  @ApiProperty({description: 'Number of ships within this fleet if fully built.'})
  @IsObject()
  size: Record<ShipTypeName, number>;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({description: 'Custom data, visible only to the owner empire.'})
  @IsObject()
  @IsOptional()
  _private?: Record<string, any>;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({description: 'Custom data, visible to everyone.'})
  @IsObject()
  @IsOptional()
  _public?: Record<string, any>;

  @Prop({type: [Object], default: []})
  @ApiPropertyOptional({description: 'Custom effects.'})
  @ValidateNested({each: true})
  @IsOptional()
  effects?: EffectSource[];
}

export const FleetSchema = SchemaFactory.createForClass(Fleet);
