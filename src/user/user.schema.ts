import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsByteLength, IsDataURI, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength} from 'class-validator';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';

export const MAX_AVATAR_LENGTH = 16 * 1024;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class User extends GlobalSchema {
  @Prop({index: {type: 1, unique: true}})
  @ApiProperty({minLength: 1, maxLength: 32})
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop()
  @IsOptional()
  @IsDataURI()
  @IsByteLength(0, MAX_AVATAR_LENGTH)
  @ApiProperty({
    description: 'Data URI with a base64-encoded image',
    externalDocs: {
      description: 'Data URI scheme - Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Data_URI_scheme',
    },
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    format: 'uri',
    required: false,
    maxLength: MAX_AVATAR_LENGTH,
  })
  avatar?: string;

  @Prop({type: Object})
  @ApiPropertyOptional({
    description: 'Custom extra information shared with other users.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  _public?: Record<string, unknown>;

  @Prop({transform: () => undefined})
  passwordHash: string;

  @Prop({type: String, transform: () => undefined})
  refreshKey?: string | null;
}

export type UserDocument = User & Document<Types.ObjectId>;

export const UserSchema = SchemaFactory.createForClass(User);
