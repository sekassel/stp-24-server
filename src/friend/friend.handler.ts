import {Injectable} from "@nestjs/common";
import {FriendsService} from "./friend.service";
import {OnEvent} from "@nestjs/event-emitter";
import {User} from "../user/user.schema";

@Injectable()
export class FriendsHandler {
  constructor(
    private friendsService: FriendsService,
  ) {
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.friendsService.deleteMany({$or: [{from: user._id}, {to: user._id}]});
  }
}
