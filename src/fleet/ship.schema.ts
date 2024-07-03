import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsNumber, IsObject, IsOptional, IsIn} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {AsObjectId, Ref} from '@mean-stream/nestx';
import {SHIP_TYPES} from "../game-logic/ships";

export type ShipDocument = Ship & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Ship extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Ref('Empire')
  @ApiPropertyOptional({description: 'Owner Empire ID, or undefined if not owned by anyone (wild fleets).'})
  @AsObjectId()
  @IsOptional()
  empire?: Types.ObjectId;

  @Ref('Fleet')
  @ApiProperty({description: 'ID of the parent fleet.'})
  @AsObjectId()
  fleet: Types.ObjectId;

  @Prop({required: true})
  @ApiProperty({description: 'Type of the ship.'})
  @IsIn(Object.values(SHIP_TYPES))
  type: string;

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
