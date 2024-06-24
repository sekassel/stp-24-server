import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {User} from '../user/user.schema';
import {FriendService} from './friend.service';

@Injectable()
export class FriendHandler {
  constructor(
    private friendService: FriendService,
  ) {
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.friendService.deleteMany({$or: [{from: user._id}, {to: user._id}]});
  }
}
