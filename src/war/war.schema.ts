import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT} from '../util/schema';
import {IsObject, IsOptional, IsString} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Ref} from '@mean-stream/nestx';

export type WarDocument = War & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class War extends GlobalSchema {
  @Ref('Game')
  @ApiProperty({
    description: 'ID of the game in which the war is taking place',
    ...MONGO_ID_FORMAT,
  })
  game: Types.ObjectId;

  @Ref('Empire')
  @ApiProperty({
    description: 'ID of the attacking empire',
    ...MONGO_ID_FORMAT,
  })
  attacker: Types.ObjectId;

  @Ref('Empire')
  @ApiProperty({
    description: 'ID of the defending empire',
    ...MONGO_ID_FORMAT,
  })
  defender: Types.ObjectId;

  @Prop({type: String, required: false})
  @ApiPropertyOptional({
    description: 'Custom name of the war',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({
    description: 'Custom data, visible to everyone',
  })
  @IsOptional()
  @IsObject()
  _public: Record<string, any>;
}

export const WarSchema = SchemaFactory.createForClass(War);
