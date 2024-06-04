import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from "../util/schema";
import {Ref} from "@mean-stream/nestx";
import {ApiProperty} from "@nestjs/swagger";
import {IsIn} from "class-validator";

export type FriendDocument = Friend & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Friend extends GlobalSchema {
  @Ref('User')
  from: Types.ObjectId;

  @Ref('User')
  to: Types.ObjectId;

  @Prop({required: true, enum: ['requested', 'accepted']})
  @ApiProperty({enum: ['requested', 'accepted']})
  @IsIn(['requested', 'accepted'])
  status: string;
}

export const FriendSchema = SchemaFactory.createForClass(Friend)
  .index({from: 1, to: 1}, {unique: true})
;
