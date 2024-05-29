// src/friends/schemas/friend.schema.ts
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from "../util/schema";

export type FriendDocument = Friend & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Friend extends GlobalSchema {
  @Prop({type: Types.ObjectId, required: true, ref: 'User'})
  from: Types.ObjectId;

  @Prop({type: Types.ObjectId, required: true, ref: 'User'})
  to: Types.ObjectId;

  @Prop({required: true, enum: ['requested', 'accepted']})
  status: string;
}

export const FriendSchema = SchemaFactory.createForClass(Friend)
  .index({from: 1, to: 1}, {unique: true})
;
