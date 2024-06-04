import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Friend, FriendDocument} from "./friend.schema";
import {Model, Types} from "mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";

@Injectable()
@EventRepository()
export class FriendsService extends MongooseRepository<Friend> {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<Friend>,
    private eventEmitter: EventService,
  ) {
    super(friendModel);
  }

  async getFriends(from: Types.ObjectId, status: string = 'accepted'): Promise<FriendDocument[]> {
    if (status === 'requested') {
      return this.friendModel.find({status: 'requested', $or: [{from}, {to: from}]}).exec();
    }
    return this.friendModel.find({from, status}).exec();
  }

  async acceptFriendRequest(to: Types.ObjectId, from: Types.ObjectId): Promise<FriendDocument | null> {
    await this.updateOne({from, to, status: 'requested'}, {status: 'accepted'}, {new: true});
    const inverseFriend = new this.friendModel({from: to, to: from, status: 'accepted'});
    return inverseFriend.save();
  }

  private emit(event: string, friend: Friend) {
    this.eventEmitter.emit(`users.${friend.from}.friends.${friend.to}.${event}`, friend);
  }
}
