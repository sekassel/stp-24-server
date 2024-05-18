import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, Ref} from '@mean-stream/nestx';

export class GameSettings {
  @Prop()
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 50,
    maximum: 200,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  size?: number;
}

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Ref('User')
  owner: Types.ObjectId;

  @ApiProperty()
  @IsInt()
  members: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxMembers?: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  started?: boolean;

  @Prop({default: 1})
  @ApiProperty({
    description: 'The speed of the game in periods per minute.',
    default: 1,
    enum: [0, 1, 2, 3],
  })
  @IsIn([0, 1, 2, 3])
  speed?: number;

  @Prop({default: 0})
  @ApiProperty({
    description: 'The current period of the game.',
    default: 0,
  })
  @IsInt()
  @Min(0)
  period: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => GameSettings)
  settings?: GameSettings;

  @Prop({
    transform: () => undefined,
  })
  passwordHash: string;
}

export type GameDocument = Doc<Game>;

export const GameSchema = SchemaFactory.createForClass(Game);
