import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Transform} from 'class-transformer';
import {IsByteLength, IsDate, IsNumber, IsOptional, IsString} from 'class-validator';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID} from '../util/schema';
import {Ref} from '@mean-stream/nestx';
import {User} from '../user/user.schema';

const MAX_ID_LENGTH = 32;

@Schema({
  ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
})
export class Achievement extends GlobalSchemaWithoutID {
  @Ref(User.name)
  user: Types.ObjectId;

  @Prop()
  @ApiProperty({ minLength: 1, maxLength: MAX_ID_LENGTH })
  @IsString()
  @IsByteLength(1, MAX_ID_LENGTH)
  id: string;

  @Prop({ type: Date, default: null })
  @ApiPropertyOptional({ type: Date, nullable: true })
  @Transform(({ value }) => value && new Date(value))
  @IsOptional()
  @IsDate()
  unlockedAt?: Date | null;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  progress?: number;
}

export type AchievementDocument = Achievement & Document<never>;

export const AchievementSchema = SchemaFactory.createForClass(Achievement)
  .index({ user: 1, id: 1 }, { unique: true })
;
