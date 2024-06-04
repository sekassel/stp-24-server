import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
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

  async createFriendRequest(from: Types.ObjectId, to: Types.ObjectId): Promise<FriendDocument> {
    const existingRequest = await this.friendModel.findOne({from: to, to: from}).exec();
    if (existingRequest) {
      throw new ConflictException('You already have a friend request from this user.');
    }

    const existingFriend = await this.friendModel.findOne({from, to}).exec();
    if (existingFriend) {
      throw new ConflictException('Friend request already exists.');
    }

    const friend = new this.friendModel({from, to, status: 'requested'});
    return friend.save();
  }

  async acceptFriendRequest(to: Types.ObjectId, from: Types.ObjectId): Promise<FriendDocument | null> {
    return this.updateOne({from, to, status: 'requested'}, {status: 'accepted'}, {new: true});
  }

  async deleteFriend(from: Types.ObjectId, to: Types.ObjectId): Promise<FriendDocument> {
    const friend = await this.friendModel.findOneAndDelete({from, to}).exec();
    if (!friend) {
      throw new NotFoundException('Friend not found.');
    }
    await this.friendModel.findOneAndDelete({from: to, to: from}).exec();
    return friend;
  }

  async deleteAllFriendsForUser(userId: Types.ObjectId): Promise<void> {
    await this.friendModel.deleteMany({$or: [{from: userId}, {to: userId}]}).exec();
  }

  private emit(event: string, friend: Friend) {
    this.eventEmitter.emit(`users.${friend.from}.friends.${friend.to}.${event}`, friend);
  }
}
