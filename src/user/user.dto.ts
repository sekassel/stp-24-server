import {ApiProperty, ApiPropertyOptional, OmitType, PickType} from '@nestjs/swagger';
import {environment} from '../environment';
import {PartialType} from '../util/partial-type';
import {User} from './user.schema';
import {tags} from 'typia';
import {MongoID} from '../util/tags';

class UserAndPassword extends OmitType(User, [
  '_id',
  'passwordHash',
  'refreshKey',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ minLength: 8 })
  password: string & tags.MinLength<8>;
}

export class CreateUserDto extends UserAndPassword {
}

export class UpdateUserDto extends PartialType(UserAndPassword) {
}

export class LoginDto extends PickType(UserAndPassword, ['name', 'password'] as const) {
}

export class RefreshDto {
  @ApiProperty({ format: 'jwt' })
  refreshToken: string; // FIXME & tags.Format<'jwt'>;
}

export class LoginResult extends User {
  @ApiProperty({
    format: 'jwt',
    description: `Token for use with Bearer Authorization. Expires after ${environment.auth.expiry}.`,
  })
  accessToken: string;

  @ApiProperty({
    format: 'jwt',
    description: `Token for use with the \`POST /api/${environment.version}/auth/refresh\` endpoint. Expires after ${environment.auth.refreshExpiry}.`,
  })
  refreshToken: string;
}

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'A comma-separated list of IDs that should be included in the response.',
  })
  ids?: (string & MongoID)[];
}
