import {Injectable} from "@nestjs/common";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Ship} from "./ship.schema";
import {SystemDocument} from "../system/system.schema";
import {SHIP_TYPES, ShipTypeName} from "../game-logic/ships";
import {FleetService} from "../fleet/fleet.service";
import {JobDocument} from "../job/job.schema";

@Injectable()
@EventRepository()
export class ShipService extends MongooseRepository<Ship> {
  constructor(
    @InjectModel(Ship.name) model: Model<Ship>,
    private eventEmitter: EventService,
    private fleetService: FleetService,
  ) {
    super(model);
  }

  emit(event: string, ship: Ship) {
    this.eventEmitter.emit(`games.${ship.game}.fleets.${ship.fleet}.ships.${ship._id}.${event}`, ship);
  }

  async buildShip(system: SystemDocument, job: JobDocument) {
    const fleet = await this.fleetService.find(job.fleet!);
    if (!fleet || fleet.location.toString() !== system._id.toString()) {
      const newFleet = await this.fleetService.create({
        _private: {},
        _public: {},
        effects: [],
        empire: job.empire,
        location: system._id,
        name: `Fleet ${Date.now()}`,
        size: {[job.ship as ShipTypeName]: 1},
        game: job.game});
      await this.createShip(newFleet._id, job.empire, job.ship!, job.game);
    } else {
      await this.createShip(fleet._id, job.empire, job.ship!, job.game);
    }
  }

  async createShip(fleet: Types.ObjectId, empire: Types.ObjectId, shipType: ShipTypeName, game: Types.ObjectId) {
    await this.model.create({
      _private: {},
      _public: {},
      empire,
      experience: 0,
      fleet,
      health: SHIP_TYPES[shipType].health,
      type: shipType,
      game});
  }
}
