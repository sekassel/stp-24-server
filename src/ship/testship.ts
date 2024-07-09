import {Types} from 'mongoose';
import {Ship} from "./ship.schema";

const testShip: Ship = {
  _id: new Types.ObjectId(),
  game: new Types.ObjectId("66869f9cfb22a91a66b21636"),
  fleet: new Types.ObjectId("6687b50774d1c3ce89e21d47"),
  empire: new Types.ObjectId("66869fabfb22a91a66b2164b"),
  type: "fighter",
  health: 100,
  experience: 200,
  _private: {
    secretWeapon: 'Plasma Cannon',
  },
  _public: {
    decoration: 'Golden Hull',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default testShip;
