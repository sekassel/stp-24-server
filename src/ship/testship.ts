import {Types} from 'mongoose';
import {Ship} from "./ship.schema";

const testShip: Ship = {
  _id: new Types.ObjectId(),
  game: new Types.ObjectId("66869f9cfb22a91a66b21636"),
  fleet: new Types.ObjectId("668d2fc924da7721254f7249"),
  empire: new Types.ObjectId("66869fabfb22a91a66b2164b"),
  type: "science",
  health: 100,
  experience: 200,
  _private: {
    secretWeapon: 'Plasma Can',
  },
  _public: {
    decoration: 'Golden Sheet',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default testShip;
