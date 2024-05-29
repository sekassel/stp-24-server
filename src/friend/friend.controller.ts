import {Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query, Req} from "@nestjs/common";
import {FriendsService} from "./friend.service";
import {ApiTags} from "@nestjs/swagger";
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";

@Controller('users/:from/friends')
@ApiTags('Friends')
@Validated()
@Throttled()
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {
  }

  @Get()
  async getFriends(
    @Param('from') from: string,
    @Query('status') status: string,
    @Req() req: any
  ) {
    if (req.user.id !== from) throw new ForbiddenException('You can only access your own friends list.');
    // TODO return this.friendsService.getFriends(from, status);
  }

  @Put(':to')
  async createFriendRequest(@Param('from') from: string, @Param('to') to: string, @Req() req: any) {
    if (req.user.id !== from) throw new ForbiddenException('You can only create friend requests from your own account.');
    // TODO return this.friendsService.createFriendRequest(from, to);
  }

  @Patch(':to')
  async acceptFriendRequest(@Param('from') from: string, @Param('to') to: string, @Req() req: any) {
    if (req.user.id !== to) throw new ForbiddenException('You can only accept friend requests to your own account.');
    // TODO return this.friendsService.acceptFriendRequest(from, to);
  }

  @Delete(':to')
  async deleteFriend(@Param('from') from: string, @Param('to') to: string, @Req() req: any) {
    if (req.user.id !== from) throw new ForbiddenException('You can only delete friends from your own account.');
    // TODO return this.friendsService.deleteFriend(from, to);
  }
}
