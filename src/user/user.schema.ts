import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {tags} from 'typia';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class User extends GlobalSchema {
  @Prop({ type: String, index: { type: 1, unique: true } })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  name: string & tags.MinLength<1> & tags.MaxLength<32>;

  @Prop({ transform: () => undefined })
  passwordHash: string;

  @Prop({ type: String, transform: () => undefined })
  refreshKey?: string | null;
}

export type UserDocument = User & Document<Types.ObjectId>;

export const UserSchema = SchemaFactory.createForClass(User);
