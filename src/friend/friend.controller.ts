import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {FriendsService} from "./friend.service";
import {Auth, AuthUser} from "../auth/auth.decorator";
import {Friend} from "./friend.schema";
import {UpdateFriendDto} from "./friend.dto";

@Controller('users/:from/friends')
@ApiTags('Friends')
@Validated()
@Throttled()
export class FriendsController {
  @Get()
  @Auth()
  @ApiOperation({description: 'Get friends list with optional status filter.'})
  @ApiOkResponse({type: [Friend]})
  @ApiQuery({
    name: 'status',
    description: 'Filter friends by status.',
    required: false,
    type: String,
    example: 'accepted',
  })
  async getFriends(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @AuthUser() user: { _id: Types.ObjectId },
    @Query('status') status?: string | undefined,
  ): Promise<Friend[]> {
    if (!from.equals(user._id)) {
      throw new ForbiddenException('You can only access your own friends list.');
    }
    return this.friendsService.getFriends(from, status);
  }

  constructor(
    private readonly friendsService: FriendsService,
  ) {
  }

  @Put(':to')
  @Auth()
  @ApiOperation({description: 'Creates a friend request by adding a Friend with from, to and status = requested.'})
  @ApiCreatedResponse({type: Friend})
  async createFriendRequest(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @AuthUser() user: { _id: Types.ObjectId },
  ): Promise<Friend> {
    if (!from.equals(user._id)) {
      throw new ForbiddenException('You can only create friend requests from your own account.');
    }
    return this.friendsService.createFriendRequest(from, to);
  }

  @Patch(':to')
  @Auth()
  @ApiOperation({description: 'Accepts a friend request. Note that the order of path parameters is swapped. ' +
      'This is done by the receiver. Creates a second Friend object with from = to, to = from, status = \'accepted\' ' +
      '(the bidirectional inverse).'})
  @ApiOkResponse({type: Friend})
  @NotFound()
  async acceptFriendRequest(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @Body() dto: UpdateFriendDto,
    @AuthUser() user: { _id: Types.ObjectId },
  ): Promise<Friend> {
    if (!to.equals(user._id)) {
      throw new ForbiddenException('You can only accept friend requests to your own account.');
    }
    return this.friendsService.acceptFriendRequest(to, from);
  }

  @Delete(':to')
  @Auth()
  @ApiOperation({description: 'Deletes the {from, to} Friend object and, if necessary, the {from: to, to: from} inverse object.'})
  @ApiOkResponse({type: Friend})
  @NotFound()
  async deleteFriend(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @AuthUser() user: { _id: Types.ObjectId },
  ): Promise<Friend> {
    if (!from.equals(user._id)) {
      throw new ForbiddenException('You can only delete friends from your own account.');
    }
    return this.friendsService.deleteFriend(from, to);
  }
}
