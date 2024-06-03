import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Friend, FriendSchema} from "./friend.schema";
import {FriendsService} from "./friend.service";
import {FriendsController} from "./friend.controller";

@Module({
  imports: [MongooseModule.forFeature([{name: Friend.name, schema: FriendSchema}])],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {
}
