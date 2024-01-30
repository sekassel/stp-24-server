import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsOptional} from 'class-validator';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID} from '../util/schema';
import {Doc, Ref} from '@mean-stream/nestx';

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
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  spectator?: boolean;
}

export type MemberDocument = Doc<Member, never>;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({game: 1, user: 1}, {unique: true})
;
