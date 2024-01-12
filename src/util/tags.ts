import {tags} from 'typia';

export type MongoID = tags.Pattern<'^[0-9a-fA-F]{24}$'>;
