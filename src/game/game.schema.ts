import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsBoolean, IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {Types, VirtualPathFunctions} from 'mongoose';
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

@Schema({
  ...GLOBAL_SCHEMA_OPTIONS,
  id: false,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
  virtuals: {
    members: {
      options: {
        ref: 'Member',
        localField: '_id',
        foreignField: 'game',
        count: true,
      },
    } satisfies VirtualPathFunctions,
  },
})
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Ref('User')
  owner: Types.ObjectId;

  @ApiProperty({
    description: 'The number of members in the game.',
    type: 'integer',
    readOnly: true,
  })
  @IsInt()
  members: number;

  @Prop()
  @ApiPropertyOptional({
    description: 'The maximum number of members allowed in the game.',
    type: 'integer',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxMembers?: number;

  @Prop({default: false})
  @ApiProperty()
  @IsBoolean()
  started: boolean;

  @Prop({default: 0})
  @ApiProperty({
    description: 'The speed of the game in periods per minute.',
    default: 1,
    enum: [0, 1, 2, 3],
  })
  @IsIn([0, 1, 2, 3])
  speed: number;

  @Prop({default: 0})
  @ApiProperty({
    description: 'The current period of the game.',
    default: 0,
  })
  @IsInt()
  @Min(0)
  period: number;

  @Prop()
  @ApiProperty({
    description: 'The timestamp when the game ticked.',
  })
  @IsDate()
  tickedAt: Date;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
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
