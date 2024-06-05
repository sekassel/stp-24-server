import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Friend, FriendDocument} from './friend.schema';
import {Model, Types} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {FriendStatus, UpdateFriendDto} from './friend.dto';

@Injectable()
@EventRepository()
export class FriendsService extends MongooseRepository<Friend> {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<Friend>,
    private eventEmitter: EventService,
  ) {
    super(friendModel);
  }

  async getFriends(from: Types.ObjectId, status: FriendStatus): Promise<FriendDocument[]> {
    if (status === FriendStatus.REQUESTED) {
      return this.friendModel.find({status: FriendStatus.REQUESTED, $or: [{from}, {to: from}]}).exec();
    }
    return this.friendModel.find({from, status}).exec();
  }

  async acceptFriendRequest(to: Types.ObjectId, from: Types.ObjectId, dto: UpdateFriendDto): Promise<FriendDocument | null> {
    const updated = await this.updateOne({from, to, status: FriendStatus.REQUESTED}, dto, {new: true});
    if (updated && dto.status === FriendStatus.ACCEPTED) {
      await this.create({from: to, to: from, status: FriendStatus.ACCEPTED});
    }
    return updated;
  }

  private emit(event: string, friend: Friend) {
    this.eventEmitter.emit(`users.${friend.from}.friends.${friend.to}.${event}`, friend, [friend.from.toString(), friend.to.toString()]);
  }
}
