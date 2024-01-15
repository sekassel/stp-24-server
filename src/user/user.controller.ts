import {Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Patch, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {NotFound} from '@mean-stream/nestx';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateUserDto, QueryUsersDto, UpdateUserDto} from './user.dto';
import {User, UserId} from './user.schema';
import {UserService} from './user.service';
import {FilterQuery} from 'mongoose';
import {TypedBody, TypedException, TypedParam, TypedQuery} from '@nestia/core';
import {ErrorResponse} from '../util/error-response';

@Controller('users')
@ApiTags('Users')
@Validated()
@Throttled()
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  /**
   * Create a new user (sign up).
   * @param dto the new user data
   */
  @Post()
  @TypedException<ErrorResponse>(HttpStatus.CONFLICT, 'Username was already taken.')
  async create(@TypedBody() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  /**
   * Lists all users.
   * @param query the filter query
   */
  @Get()
  @Auth()
  async getUsers(
    @TypedQuery() query: QueryUsersDto,
  ): Promise<User[]> {
    const filter: FilterQuery<User> = {};
    if (query.ids) {
      filter._id = query.ids;
    }
    return this.userService.findAll(filter, {sort: '+name'});
  }

  /**
   * Informs about the user with the given ID.
   * @param id the ID of the user to get
   */
  @Get(':id')
  @Auth()
  @NotFound()
  async getUser(
    @TypedParam('id') id: UserId,
  ): Promise<User | null> {
    return this.userService.find(id);
  }

  /**
   * Updates the user with the given ID.
   * @param user the authenticated user
   * @param id the ID of the user to update
   * @param dto the new user data
   */
  @Patch(':id')
  @Auth()
  @NotFound()
  @TypedException<ErrorResponse>(HttpStatus.CONFLICT, 'Username was already taken.')
  @TypedException<ErrorResponse>(HttpStatus.FORBIDDEN, 'Cannot change someone else\'s user.')
  async update(
    @AuthUser() user: User,
    @TypedParam('id') id: UserId,
    @Body() dto: UpdateUserDto,
  ): Promise<User | null> {
    if (user._id !== id) {
      throw new ForbiddenException('Cannot change someone else\'s user.');
    }
    return this.userService.update(id, dto);
  }

  /**
   * Deletes the user with the given ID.
   * @param user the authenticated user
   * @param id the ID of the user to delete
   */
  @Delete(':id')
  @Auth()
  @NotFound()
  @TypedException<ErrorResponse>(HttpStatus.FORBIDDEN, 'Cannot delete someone else\'s user.')
  async delete(
    @AuthUser() user: User,
    @TypedParam('id') id: UserId,
  ): Promise<User | null> {
    if (user._id != id) {
      throw new ForbiddenException('Cannot delete someone else\'s user.');
    }
    return this.userService.delete(id);
  }
}
