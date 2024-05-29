import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Friend, FriendDocument} from "./friend.schema";
import {Model} from "mongoose";

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friend.name) private friendModel: Model<FriendDocument>) {
  }
}
