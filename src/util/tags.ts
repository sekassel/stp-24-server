import {tags} from 'typia';

export type MongoID = tags.Pattern<'^[0-9a-fA-F]{24}$'>;
export type JWT = tags.TagBase<{
  target: 'string';
  kind: 'jwt';
  value: undefined;
}>;
