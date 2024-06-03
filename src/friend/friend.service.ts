import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Friend, FriendDocument} from "./friend.schema";
import {Model, Types} from "mongoose";

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friend.name) private friendModel: Model<FriendDocument>) {
  }

  async getFriends(from: Types.ObjectId, status?: string): Promise<Friend[]> {
    const query: { from: Types.ObjectId; status?: string } = {from};
    if (status) {
      query.status = status;
    } else {
      query.status = 'accepted';
    }
    return this.friendModel.find(query).exec();
  }

  async createFriendRequest(from: Types.ObjectId, to: Types.ObjectId): Promise<Friend> {
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
}
