import {OmitType, PickType} from '@nestjs/swagger';
import {PartialType} from '../util/partial-type';
import {User} from './user.schema';
import {tags} from 'typia';
import {JWT, MongoID} from '../util/tags';

class UserAndPassword extends OmitType(User, [
  '_id',
  'passwordHash',
  'refreshKey',
  'createdAt',
  'updatedAt',
]) {
  password: string & tags.MinLength<8>;
}

export class CreateUserDto extends UserAndPassword {
}

export class UpdateUserDto extends PartialType(UserAndPassword) {
}

export class LoginDto extends PickType(UserAndPassword, ['name', 'password'] as const) {
}

export class RefreshDto {
  refreshToken: string & JWT;
}

export class LoginResult extends User {
  /**
   * Token for use with Bearer Authorization. Expires after ${environment.auth.expiry}.
   */
  accessToken: string & JWT;

  /**
   * Token for use with the `POST /api/${environment.version}/auth/refresh` endpoint. Expires after ${environment.auth.refreshExpiry}.
   */
  refreshToken: string;
}

export class QueryUsersDto {
  /**
   * A comma-separated list of IDs that should be included in the response.
   */
  ids?: (string & MongoID)[];
}
