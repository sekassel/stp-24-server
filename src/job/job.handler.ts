import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {JobService} from "./job.service";
import {Game} from "../game/game.schema";

@Injectable()
export class FriendHandler {
  constructor(
    private jobService: JobService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.jobService.deleteMany(game._id);
  }
}
