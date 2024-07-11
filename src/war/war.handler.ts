import {Injectable} from "@nestjs/common";
import {WarService} from "./war.service";
import {OnEvent} from "@nestjs/event-emitter";
import {Game} from "../game/game.schema";
import {Empire} from "../empire/empire.schema";

@Injectable()
export class WarHandler {
  constructor(
    private warService: WarService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.warService.deleteMany({game: game._id});
  }

  @OnEvent('games.*.empires.*.deleted')
  async onEmpireDeleted(empire: Empire): Promise<void> {
    await this.warService.deleteMany({$or: [{attacker: empire._id}, {defender: empire._id}]});
  }
}
