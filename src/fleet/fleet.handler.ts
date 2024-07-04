import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {Game} from "../game/game.schema";
import {FleetService} from "./fleet.service";

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
}
