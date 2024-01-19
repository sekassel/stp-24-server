import {Controller, Delete, ForbiddenException, Get, Put} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User, UserId} from '../user/user.schema';
import {NotFound} from '@mean-stream/nestx';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {UpdateAchievementDto} from './achievement.dto';
import {Achievement, AchievementId} from './achievement.schema';
import {AchievementService} from './achievement.service';
import {TypedBody, TypedParam} from '@nestia/core';

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
    @TypedParam('user') user: UserId,
  ): Promise<Achievement[]> {
    return this.achievementService.findAll({user});
  }

  @Get(':id')
  @ApiOkResponse({ type: Achievement })
  @NotFound()
  async findOne(
    @TypedParam('user') user: UserId,
    @TypedParam('id') id: AchievementId,
  ): Promise<Achievement | null> {
    return this.achievementService.findOne({user, id});
  }

  @Put(':id')
  @ApiOkResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Adding an achievement to another user.' })
  async create(
    @AuthUser() authUser: User,
    @TypedParam('user') user: UserId,
    @TypedParam('id') id: AchievementId,
    @TypedBody() achievement: UpdateAchievementDto,
  ): Promise<Achievement> {
    if (user !== authUser._id) {
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
    @TypedParam('user') user: UserId,
    @TypedParam('id') id: AchievementId,
  ): Promise<Achievement | null> {
    if (user !== authUser._id) {
      throw new ForbiddenException('Cannot delete achievement of another user.');
    }
    return this.achievementService.deleteOne({user, id});
  }
}
