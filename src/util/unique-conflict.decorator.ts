import {applyDecorators, ArgumentsHost, Catch, ConflictException, UseFilters} from '@nestjs/common';
import {ApiConflictResponse} from '@nestjs/swagger';
import {mongo} from 'mongoose';
import {BaseExceptionFilter} from '@nestjs/core';

// TODO move everything to @mean-stream/nestx

/**
 * Converts a MongoServerError with code 11000 into a ConflictException with a configurable message.
 */
@Catch(mongo.MongoServerError)
class ConflictExceptionFilter extends BaseExceptionFilter {
  constructor(
    private description: Partial<Record<string, string>>,
  ) {
    super();
  }

  catch(exception: mongo.MongoServerError, host: ArgumentsHost): any {
    if (exception.code !== 11000) {
      return super.catch(exception, host);
    }

    const keyPattern = exception.keyPattern; // e.g. { username: 1 }
    const values = exception.keyValue; // e.g. { username: 'test' }
    const indexKey = Object.keys(keyPattern).join('_');
    const http = new ConflictException(this.description[indexKey] ?? `Unique constraint violation on '${indexKey}' with value ${JSON.stringify(values)}.`);
    return super.catch(http, host);
  }
}

export type IndexKey<T> = keyof T | `${keyof T & string}_${keyof T & string | string}`;

/**
 * Decorator to convert `MongoServerError`s with code 11000 (duplicate key) into a `ConflictException` with a
 * configurable message.
 * This adds the following decorators:
 * - {@link ApiConflictResponse} with a description listing all the possible error messages.
 *   To override the conflict repsponse description, use the {@link ApiConflictResponse} decorator *before* this as
 *   shown in the example.
 * - {@link UseFilters}({@link ConflictExceptionFilter}) decorators.
 *
 * @param descriptions A map of index keys to error messages.
 * If the index is a compound index, the index key must be a concatenation of the keys in the order they appear in the
 * index definition, separated by an underscore.
 *
 * @example simple unique constraints
 * // user.schema.ts:
 * UserSchema.index({ name: 1 }, { unique: true });
 * // user.controller.ts
 * @@UniqueConflict<User>({ name: 'Username is already taken.'})
 *
 * @example compound unique constraints
 * // member.schema.ts:
 * MemberSchema.index({ game: 1, user: 1 }, { unique: true });
 * // member.controller.ts
 * @@UniqueConflict<Member>({ game_user: 'User is already a member of this game.' })
 *
 * @example custom API description
 * // note that the order of decorators is important here
 * @@ApiConflictResponse({description: 'Game already started or user already joined.'})
 * @@UniqueConflict<Member>({ game_user: 'User is already a member of this game.' })
 */
export function UniqueConflict<T>(descriptions: Partial<Record<IndexKey<T>, string>>): MethodDecorator {
  const keys = Object.keys(descriptions);
  const description = keys.length === 1 ? keys[0] : '- ' + keys.join('\n- ');
  return applyDecorators(
    ApiConflictResponse({description}),
    UseFilters(new ConflictExceptionFilter(descriptions)),
  )
}