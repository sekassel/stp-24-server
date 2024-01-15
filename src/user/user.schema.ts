import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {tags} from 'typia';
import {Doc} from '@mean-stream/nestx';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class User extends GlobalSchema {
  @Prop({ type: String, index: { type: 1, unique: true } })
  name: string & tags.MinLength<1> & tags.MaxLength<32>;

  @Prop({ transform: () => undefined })
  passwordHash?: string;

  @Prop({ type: String, transform: () => undefined })
  refreshKey?: string | null;
}

export type UserDocument = Doc<User, string>;

export const UserSchema = SchemaFactory.createForClass(User);
