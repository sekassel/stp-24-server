import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemDocument} from './system.schema';
import {Game} from '../game/game.schema';
import {UpdateSystemDto} from './system.dto';
import {EmpireDocument} from '../empire/empire.schema';
import {SystemGeneratorService} from './systemgenerator.service';
import {MemberService} from '../member/member.service';
import {SystemLogicService} from './system-logic.service';

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
    private memberService: MemberService,
    private systemGenerator: SystemGeneratorService,
    private systemLogicService: SystemLogicService,
  ) {
    super(model);
  }

  updateSystem(system: SystemDocument, dto: UpdateSystemDto, empire: EmpireDocument) {
    const {districts, buildings, ...rest} = dto;
    system.set(rest);
    if (districts) {
      this.systemLogicService.destroyDistricts(system, districts, empire);
    }
    if (buildings) {
      this.systemLogicService.updateBuildings(system, buildings, empire);
    }
  }

  async generateMap(game: Game): Promise<SystemDocument[]> {
    return this.createMany(this.systemGenerator.generateMap(game));
  }

  private async emit(event: string, system: System) {
    const members = await this.memberService.findAll({game: system.game}, {projection: {user: 1}});
    // TODO mask population, districts and buildings
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system, members.map(m => m.user.toString()));
  }
}
