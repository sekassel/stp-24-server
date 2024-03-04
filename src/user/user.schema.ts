import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString, MaxLength} from 'class-validator';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {TECHNOLOGIES} from "../game-logic/technologies";

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class User extends GlobalSchema {
  @Prop({index: {type: 1, unique: true}})
  @ApiProperty({minLength: 1, maxLength: 32})
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop({transform: () => undefined})
  passwordHash: string;

  @Prop({type: String, transform: () => undefined})
  refreshKey?: string | null;

  @Prop({type: Object})
  technologies?: Partial<Record<TechId, number>> | null;
}

export type TechId = keyof typeof TECHNOLOGIES;

export type UserDocument = User & Document<Types.ObjectId>;

export const UserSchema = SchemaFactory.createForClass(User);
