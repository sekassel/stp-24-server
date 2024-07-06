import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsIn, IsNumber, IsObject, IsOptional} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {OptionalRef, Ref} from '@mean-stream/nestx';
import {SHIP_TYPES, ShipTypeName} from "../game-logic/ships";

export type ShipDocument = Ship & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Ship extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @OptionalRef('Empire')
  @ApiPropertyOptional({description: 'Owner Empire ID, or undefined if not owned by anyone (wild fleets).'})
  empire?: Types.ObjectId;

  @Ref('Fleet')
  @ApiProperty({description: 'ID of the parent fleet.'})
  fleet: Types.ObjectId;

  @Prop({type: String, required: true})
  @ApiProperty({description: 'Type of the ship.'})
  @IsIn(Object.values(SHIP_TYPES))
  type: ShipTypeName;

  @Prop({required: true})
  @ApiProperty({description: 'Current health of the ship.'})
  @IsNumber()
  health: number;

  @Prop({required: true})
  @ApiProperty({description: 'Total experience of the ship.'})
  @IsNumber()
  experience: number;

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
}

export const ShipSchema = SchemaFactory.createForClass(Ship);
