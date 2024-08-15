import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {JobService} from './job.service';
import {Game} from '../game/game.schema';
import {Empire} from '../empire/empire.schema';
import {Fleet} from '../fleet/fleet.schema';
import {JobType} from './job-type.enum';

@Injectable()
export class JobHandler {
  constructor(
    private jobService: JobService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.jobService.deleteMany({game: game._id});
  }

  @OnEvent('games.*.empires.*.deleted')
  async onEmpireDeleted(empire: Empire): Promise<void> {
    await this.jobService.deleteMany({empire: empire._id});
  }

  @OnEvent('games.*.fleets.*.deleted')
  async onFleetDeleted(fleet: Fleet): Promise<void> {
    // Cancel travel jobs when a fleet is deleted.
    // We don't delete the ship jobs because they can complete without the fleet existing,
    // and we would have to refund resources, which is not practical here.
    await this.jobService.deleteMany({
      type: JobType.TRAVEL,
      fleet: fleet._id,
    });
  }
}
