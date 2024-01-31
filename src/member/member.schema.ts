import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min, ValidateNested,
} from 'class-validator';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID} from '../util/schema';
import {Doc, Ref} from '@mean-stream/nestx';
import {MAX_EMPIRES, MAX_STARTER_BONI} from '../game-logic/constants';
import {Type} from 'class-transformer';

export class Empire {
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
  /* TODO v3
  @ApiProperty({
    description: 'Starter boni that were selected for this empire.',
    maxLength: MAX_STARTER_BONI,
  })
   */
  @IsArray()
  @IsString({each: true})
  @MaxLength(MAX_STARTER_BONI)
  starterBoni: string[];
}

@Schema(GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS)
export class Member extends GlobalSchemaWithoutID {
  @Ref('Game')
  game: Types.ObjectId;

  @Ref('User')
  user: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsBoolean()
  ready: boolean;

  @Prop()
  @ApiPropertyOptional()
  @Type(() => Empire)
  @IsOptional()
  @ValidateNested()
  empire?: Empire;
}

export type MemberDocument = Doc<Member, never>;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({game: 1, user: 1}, {unique: true})
;
