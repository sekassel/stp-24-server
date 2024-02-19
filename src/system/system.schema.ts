import {Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {BuildingName} from "../game-logic/buildings";

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class System extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  type: string;

  buildingSlots: Partial<Record<BuildingName, number>>;

  buildings: Partial<Record<BuildingName, number>>;

  capacity: number;

  upgrade: number;

  links: Record<string, number>;

  x: number;

  y: number;

  @OptionalRef('Empire')
  owner?: Types.ObjectId;
}

export type SystemDocument = Doc<System>;

export const SystemSchema = SchemaFactory.createForClass(System);
