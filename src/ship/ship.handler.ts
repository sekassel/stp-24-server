import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {ShipService} from './ship.service';
import {Fleet} from '../fleet/fleet.schema';

@Injectable()
export class ShipHandler {
  constructor(
    private shipService: ShipService,
  ) {
  }

  @OnEvent('games.*.fleets.*.created')
  async onFleetCreated(fleet: Fleet): Promise<void> {
    if (fleet.ships) { // this means the fleet was created with ships (crisis)
      await this.shipService.createShips([fleet]);
    }
  }

  @OnEvent('games.*.fleets.*.deleted')
  async onFleetDeleted(fleet: Fleet): Promise<void> {
    await this.shipService.deleteMany({fleet: fleet._id});
  }
}
