import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, Ref} from '@mean-stream/nestx';
import {BUILDINGS} from '../game-logic/buildings';
import {ApiProperty} from '@nestjs/swagger';
import {IsArray, IsHexColor, IsInt, IsNotEmpty, IsObject, IsString, Max, MaxLength, Min} from 'class-validator';
import {MAX_EMPIRES, MAX_TRAITS} from '../game-logic/constants';
import {ResourceName, RESOURCES} from '../game-logic/resources';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Empire extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Ref('User')
  user: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Prop()
  @ApiProperty()
  @IsHexColor()
  color: string;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the flag this empire will use.',
    minimum: 1,
    maximum: MAX_EMPIRES,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EMPIRES)
  flag: number;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the portrait this empire\'s population will use.',
    minimum: 1,
    maximum: MAX_EMPIRES,
  })
  portrait: number;

  @Prop()
  @ApiProperty({
    description: 'Starter traits that were selected for this empire.',
    maxLength: MAX_TRAITS,
  })
  @IsArray()
  @IsString({each: true})
  @MaxLength(MAX_TRAITS)
  traits: string[];

  @Prop({type: Object, default: {}})
  @IsObject()
  @ApiProperty({
    type: 'object',
    properties: Object.fromEntries(Object.keys(RESOURCES).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
      required: false,
    }])) as any,
  })
  resources: Partial<Record<ResourceName, number>>;

  @Prop()
  @IsArray()
  @IsString({each: true})
  technologies: string[];
}

export type EmpireDocument = Doc<Empire>;

export const EmpireSchema = SchemaFactory.createForClass(Empire);
