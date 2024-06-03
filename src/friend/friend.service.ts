import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Friend, FriendDocument} from "./friend.schema";
import {FilterQuery, Model, Types} from "mongoose";
import {EventRepository, EventService} from "@mean-stream/nestx";

@Injectable()
@EventRepository()
export class FriendsService {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<FriendDocument>,
    private eventEmitter: EventService,
  ) {
  }

  async getFriends(from: Types.ObjectId, status?: string): Promise<Friend[]> {
    const query: FilterQuery<Friend> = {from};
    query.status = status || 'accepted';

    if (query.status === 'requested') {
      return this.friendModel.find({status: 'requested', $or: [{from}, {to: from}]}).exec();
    }
    return this.friendModel.find(query).exec();
  }

  async createFriendRequest(from: Types.ObjectId, to: Types.ObjectId): Promise<Friend> {
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


  async acceptFriendRequest(to: Types.ObjectId, from: Types.ObjectId): Promise<Friend> {
    const friendRequest = await this.friendModel.findOne({from, to}).exec();
    if (!friendRequest || friendRequest.status !== 'requested') {
      throw new NotFoundException('Friend request not found.');
    }
    friendRequest.status = 'accepted';
    await friendRequest.save();

    const friend = new this.friendModel({from: to, to: from, status: 'accepted'});
    return friend.save();
  }

  async deleteFriend(from: Types.ObjectId, to: Types.ObjectId): Promise<Friend> {
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
    this.eventEmitter.emit(`friends.${friend._id}.${event}`, friend);
  }
}
