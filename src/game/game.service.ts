import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {Model} from 'mongoose';
import {CreateGameDto, UpdateGameDto} from './game.dto';
import {Game, GameDocument} from './game.schema';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {GlobalSchema} from '../util/schema';

@Injectable()
@EventRepository()
export class GameService extends MongooseRepository<Game> {
  constructor(
    @InjectModel(Game.name) model: Model<Game>,
    private eventService: EventService,
  ) {
    super(model);
  }

  private async hash(dto: UpdateGameDto) {
    const {password, ...rest} = dto;
    const result: Partial<Game> = rest;
    if (password) {
      const passwordSalt = await bcrypt.genSalt();
      result.passwordHash = await bcrypt.hash(password, passwordSalt);
    }
    return result;
  }

  async create(game: CreateGameDto | Omit<Game, keyof GlobalSchema>): Promise<GameDocument> {
    return super.create((await this.hash(game)) as Game);
  }

  emit(event: string, game: Game): void {
    this.eventService.emit(`games.${game._id}.${event}`, game);
  }
}
