import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {IsNumber, IsObject, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {ResourceName} from '../game-logic/resources';
import {ShipTypeName} from "../game-logic/ships";

export type ShipTypeDocument = ShipType & Document;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class ShipType extends GlobalSchema {
  @Prop({required: true})
  @ApiProperty()
  @IsString()
  id: string;

  @Prop({required: true})
  @ApiProperty({description: 'Duration in periods for building this ship.'})
  @IsNumber()
  build_time: number;

  @Prop({required: true})
  @ApiProperty({description: 'Base maximum health of the ship.'})
  @IsNumber()
  health: number;

  @Prop({required: true})
  @ApiProperty({description: 'Speed of the ship through systems and links.'})
  @IsNumber()
  speed: number;

  @Prop({type: Map, of: Number})
  @ApiProperty({description: 'Attack damage against each other type of ships.'})
  @IsObject()
  attack: Record<ShipTypeName, number>;

  @Prop({type: Map, of: Number})
  @ApiProperty({description: 'Defense against each other type of ship.'})
  @IsObject()
  defense: Record<ShipTypeName, number>;

  @Prop({type: Object, default: {}})
  @ApiProperty({description: 'Costs to build this type of ship.'})
  @IsObject()
  cost: Partial<Record<ResourceName, number>>;

  @Prop({type: Object, default: {}})
  @ApiProperty({description: 'Periodic cost to maintain this type of ship.'})
  @IsObject()
  upkeep: Partial<Record<ResourceName, number>>;
}

export const ShipTypeSchema = SchemaFactory.createForClass(ShipType);
