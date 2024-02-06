import {Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {BuildingName} from "../game-logic/buildings";

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class System extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  buildings: Partial<Record<BuildingName, number>>;

  upgrade: number;

  @OptionalRef('Empire')
  owner?: Types.ObjectId;

  //TODO: Implement like issue
}

export type SystemDocument = Doc<System>;

export const SystemSchema = SchemaFactory.createForClass(System);
