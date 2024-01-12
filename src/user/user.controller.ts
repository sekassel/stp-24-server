import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query,} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateUserDto, QueryUsersDto, UpdateUserDto} from './user.dto';
import {User} from './user.schema';
import {UserService} from './user.service';
import {FilterQuery, Types} from "mongoose";
import {TypedBody, TypedParam, TypedQuery, TypedRoute} from '@nestia/core';
import {MongoID} from '../util/tags';

@Controller('users')
@ApiTags('Users')
@Validated()
@Throttled()
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @TypedRoute.Post()
  @ApiOperation({ description: 'Create a new user (sign up).' })
  @ApiCreatedResponse({ type: User })
  @ApiConflictResponse({ description: 'Username was already taken.' })
  async create(@TypedBody() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @TypedRoute.Get()
  @Auth()
  @ApiOperation({ description: 'Lists all online users.' })
  @ApiOkResponse({ type: [User] })
  async getUsers(
    @TypedQuery() { ids }: QueryUsersDto,
  ): Promise<User[]> {
    const filter: FilterQuery<User> = {};
    if (ids) {
      filter._id = { $in: ids };
    }
    return this.userService.findAll(filter, {sort: '+name'});
  }

  @TypedRoute.Get(':id')
  @Auth()
  @ApiOperation({ description: 'Informs about the user with the given ID.' })
  @ApiOkResponse({ type: User })
  @NotFound()
  async getUser(
    @TypedParam('id') id: string & MongoID,
  ): Promise<User | null> {
    return this.userService.find(new Types.ObjectId(id));
  }

  @TypedRoute.Patch(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Attempt to change someone else\'s user.' })
  @ApiConflictResponse({ description: 'Username was already taken.' })
  async update(
    @AuthUser() user: User,
    @TypedParam('id') id: string & MongoID,
    @Body() dto: UpdateUserDto,
  ): Promise<User | null> {
    if (!user._id.equals(id)) {
      throw new ForbiddenException('Cannot change someone else\'s user.');
    }
    return this.userService.update(new Types.ObjectId(id), dto);
  }

  @TypedRoute.Delete(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Attempt to delete someone else\'s user.' })
  async delete(
    @AuthUser() user: User,
    @TypedParam('id') id: string & MongoID,
  ): Promise<User | null> {
    if (!user._id.equals(id)) {
      throw new ForbiddenException('Cannot delete someone else\'s user.');
    }
    return this.userService.delete(new Types.ObjectId(id));
  }
}
