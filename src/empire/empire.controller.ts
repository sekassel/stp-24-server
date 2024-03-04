import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Patch,
  Query
} from '@nestjs/common';
import {ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, refs} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {ReadEmpireDto, UpdateEmpireDto} from './empire.dto';
import {Empire} from './empire.schema';
import {EmpireService} from './empire.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {ExplainedVariable, Variable} from '../game-logic/types';
import {explainVariable, getEmpireEffectSources} from '../game-logic/variables';
import {TECHNOLOGIES} from "../game-logic/technologies";
import {UserService} from "../user/user.service";

@Controller('games/:game/empires')
@ApiTags('Game Empires')
@Validated()
@Auth()
@Throttled()
export class EmpireController {
  constructor(
    private readonly empireService: EmpireService,
    private readonly userService: UserService,
  ) {
  }

  @Get()
  @ApiOkResponse({type: [Empire]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<ReadEmpireDto[]> {
    const empires = await this.empireService.findAll({game});
    return empires.map(e => this.empireService.mask(e));
  }

  @Get(':id')
  @ApiOkResponse({schema: {oneOf: refs(Empire, ReadEmpireDto)}})
  @NotFound()
  async findOne(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Empire | ReadEmpireDto | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    return currentUser._id.equals(empire.user) ? empire : this.empireService.mask(empire);
  }

  @Patch(':id')
  @ApiOperation({description: 'Update empire details.'})
  @ApiOkResponse({type: Empire})
  @ApiForbiddenResponse({description: 'Cannot modify another user\'s empire.'})
  @NotFound('Game or empire not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateEmpireDto,
  ): Promise<Empire | null> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot modify another user\'s empire.');
    }
    // Unlock technologies if the empire has the required resources and predecessor technologies
    for (const technologyId of dto.technologies) {
      const technology = TECHNOLOGIES[technologyId];
      if (!technology) {
        throw new NotFoundException(`Technology ${technologyId} not found.`);
      }

      // Check if all required technologies are unlocked
      const hasAllRequiredTechnologies = technology.requires?.every(
        (requiredTechnology: string) => empire.technologies.includes(requiredTechnology)
      ) ?? true;

      if (!hasAllRequiredTechnologies) {
        throw new BadRequestException(`Missing required technologies for ${technologyId}.`);
      }

      // Calculate the technology cost based on the formula
      const user = await this.userService.findUserById(empire.user);
      const technologyCount = user.technologies?.[technologyId] || 0;
      const technologyCost = technology.cost * Math.pow(0.95, Math.min(technologyCount, 10));

      if (empire.resources.research < technologyCost) {
        throw new BadRequestException(`Not enough research points to unlock ${technologyId}.`);
      }

      // Deduct research points and unlock technology
      empire.resources.research -= technologyCost;
      if (!empire.technologies.includes(technologyId)) {
        empire.technologies.push(technologyId);
        if (!user.technologies) {
          user.technologies = {};
        }

        // Increment the user's technology count by 1
        // user.technologies[technologyId] = (user.technologies[technologyId] || 0) + 1;
        await this.userService.update(user._id, {technologies: user.technologies});
      }
    }
    const updateDto = {
      ...dto,
      resources: empire.resources,
      technologies: empire.technologies,
    };
    // TODO: implement resource trading
    return this.empireService.update(id, updateDto);
  }

  @Get('variables')
  @ApiOperation({summary: 'Get the value and explanation of multiple empire variable.'})
  @ApiOkResponse({type: [ExplainedVariable]})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variables.'})
  @NotFound()
  async getVariables(
    @AuthUser() currentUser: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Query('variables', ParseArrayPipe) variable: Variable[],
  ): Promise<ExplainedVariable[]> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const effectSources = getEmpireEffectSources(empire);
    return variable.map(v => explainVariable(v, effectSources));
  }

  @Get('variables/:variable')
  @ApiOperation({summary: 'Get the value and explanation of an empire variable.'})
  @ApiOkResponse({type: ExplainedVariable})
  @ApiForbiddenResponse({description: 'Cannot view another user\'s empire variable.'})
  @NotFound()
  async getVariable(
    @AuthUser() currentUser: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Param('variable') variable: Variable,
  ): Promise<ExplainedVariable> {
    const empire = await this.empireService.find(id) ?? notFound(id);
    if (!currentUser._id.equals(empire.user)) {
      throw new ForbiddenException('Cannot view another user\'s empire variable.');
    }
    const effectSources = getEmpireEffectSources(empire);
    return explainVariable(variable, effectSources);
  }
}
