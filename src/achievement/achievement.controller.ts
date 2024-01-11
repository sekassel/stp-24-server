import {Body, Controller, Delete, ForbiddenException, Get, Param, Put} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {UpdateAchievementDto} from './achievement.dto';
import {Achievement} from './achievement.schema';
import {AchievementService} from './achievement.service';
import {Types} from 'mongoose';

@Controller('users/:user/achievements')
@ApiTags('Achievements')
@Validated()
@Auth()
@Throttled()
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Achievement] })
  async findAll(
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
  ): Promise<Achievement[]> {
    return this.achievementService.findAll({user});
  }

  @Get(':id')
  @ApiOkResponse({ type: Achievement })
  @NotFound()
  async findOne(
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
    @Param('id') id: string,
  ): Promise<Achievement | null> {
    return this.achievementService.findOne({user, id});
  }

  @Put(':id')
  @ApiOkResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Adding an achievement to another user.' })
  async create(
    @AuthUser() authUser: User,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
    @Param('id') id: string,
    @Body() achievement: UpdateAchievementDto,
  ): Promise<Achievement> {
    if (!authUser._id.equals(user)) {
      throw new ForbiddenException('Cannot add achievement for another user.');
    }
    return this.achievementService.upsert({user, id}, achievement);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Attempt to delete achievement of another user.' })
  @NotFound()
  async delete(
    @AuthUser() authUser: User,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
    @Param('id') id: string,
  ): Promise<Achievement | null> {
    if (!authUser._id.equals(user)) {
      throw new ForbiddenException('Cannot delete achievement of another user.');
    }
    return this.achievementService.deleteOne({user, id});
  }
}
