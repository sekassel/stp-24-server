import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {Model, Types, UpdateQuery} from 'mongoose';
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

  private async hash<T extends object>(dto: T): Promise<Omit<T, 'password'> & {passwordHash?: string}> {
    if ('password' in dto) {
      const passwordSalt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(dto.password as string, passwordSalt);
      const result = {...dto, passwordHash};
      delete result.password;
      return result;
    }
    return dto;
  }

  async create(game: CreateGameDto | Omit<Game, keyof GlobalSchema>): Promise<GameDocument> {
    return super.create((await this.hash(game)) as Omit<Game, keyof GlobalSchema>);
  }

  async update(id: Types.ObjectId, game: UpdateGameDto | UpdateQuery<Game>): Promise<GameDocument | null> {
    return super.update(id, await this.hash(game));
  }

  emit(event: string, game: Game): void {
    this.eventService.emit(`games.${game._id}.${event}`, game);
  }
}
