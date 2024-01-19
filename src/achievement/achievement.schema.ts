import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID} from '../util/schema';
import {User, UserId} from '../user/user.schema';
import {tags} from 'typia';

const MAX_ID_LENGTH = 32;

export type AchievementId = string & tags.MinLength<1> & tags.MaxLength<typeof MAX_ID_LENGTH>;

@Schema({
  ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
})
export class Achievement extends GlobalSchemaWithoutID {
  @Prop({type: Types.ObjectId, ref: () => User})
  user: UserId;

  @Prop()
  id: AchievementId;

  @Prop({ type: Date, default: null })
  unlockedAt?: Date | null;

  @Prop()
  progress?: number;
}

export type AchievementDocument = Achievement & Document<never>;

export const AchievementSchema = SchemaFactory.createForClass(Achievement)
  .index({ user: 1, id: 1 }, { unique: true })
;
