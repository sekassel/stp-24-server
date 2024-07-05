import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {Game} from "../game/game.schema";
import {FleetService} from "./fleet.service";
import {Empire} from "../empire/empire.schema";

@Injectable()
export class FleetHandler {
  constructor(
    private fleetService: FleetService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.fleetService.deleteMany({game: game._id});
  }

  @OnEvent('games.*.empires.*.deleted')
  async onEmpireDeleted(empire: Empire): Promise<void> {
    await this.fleetService.deleteMany({empire: empire._id});
  }
}
