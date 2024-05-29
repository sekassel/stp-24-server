import {Controller, ForbiddenException, Get, Param, Query, Req} from "@nestjs/common";
import {FriendsService} from "./friend.service";

@Controller('users/:from/friends')
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
}
