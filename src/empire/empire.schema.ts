import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject, IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {MAX_EMPIRES, MAX_TRAITS} from '../game-logic/constants';
import {ResourceName} from '../game-logic/resources';
import {TRAITS} from '../game-logic/traits';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {RESOURCES_SCHEMA_PROPERTIES} from '../game-logic/types';

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
  @ApiPropertyOptional({description: 'Optional description/lore for this empire.'})
  @IsOptional()
  @IsString()
  description?: string;

  @Prop()
  @ApiProperty()
  @IsHexColor()
  color: string;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the flag this empire will use.',
    minimum: 0,
    maximum: MAX_EMPIRES,
  })
  @IsInt()
  @Min(0)
  @Max(MAX_EMPIRES)
  flag: number;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the portrait this empire\'s population will use.',
    minimum: 0,
    maximum: MAX_EMPIRES,
  })
  @IsInt()
  @Min(0)
  @Max(MAX_EMPIRES)
  portrait: number;

  @ApiPropertyOptional({
    ...MONGO_ID_FORMAT,
    description: 'The home system of this empire. Undefined until systems are generated',
  })
  @OptionalRef('System')
  homeSystem?: Types.ObjectId;

  @Prop()
  @ApiProperty({
    description: 'Starter traits that were selected for this empire.',
    maxItems: MAX_TRAITS,
  })
  @IsArray()
  @IsString({each: true})
  @ArrayMaxSize(MAX_TRAITS)
  @IsIn(Object.keys(TRAITS), {each: true})
  traits: string[];

  @Prop({type: Object})
  @IsObject()
  @ApiProperty({
    description: 'Resources that this empire starts with. Defaults to 0 for all resources.',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  resources: Record<ResourceName, number>;

  @Prop()
  @ApiProperty({
    description: 'Unlocked technologies.',
  })
  @IsArray()
  @IsIn(Object.keys(TECHNOLOGIES), {each: true})
  technologies: string[];
}

export type EmpireDocument = Doc<Empire>;

export const EmpireSchema = SchemaFactory.createForClass(Empire);
