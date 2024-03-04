import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {EmpireService} from './empire.service';
import {User} from '../user/user.schema';
import {MemberService} from '../member/member.service';
import {calculateVariables, flatten} from '../game-logic/variables';
import {RESOURCE_NAMES, RESOURCES} from '../game-logic/resources';
import {Variable} from '../game-logic/types';

@Injectable()
export class EmpireHandler {
  constructor(
    private empireService: EmpireService,
    private memberService: MemberService,
  ) {
  }

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (!game.started) {
      return;
    }

    const existingEmpires = await this.empireService.findAll({
      game: game._id,
    });
    if (existingEmpires.length) {
      return;
    }

    const members = await this.memberService.findAll({
      game: game._id,
    });
    await this.empireService.createMany(members
      .filter(m => m.empire)
      .map(member => {
        const resourceVariables: Record<Variable & `resources.${string}`, number> = flatten(RESOURCES, 'resources.');
        calculateVariables(resourceVariables, {
          traits: member.empire!.traits,
          technologies: [],
        });
        const resources: any = {};
        for (const resource of RESOURCE_NAMES) {
          resources[resource] = resourceVariables[`resources.${resource}.starting`];
        }
        return ({
          ...member.empire!,
          game: game._id,
          user: member.user,
          technologies: [],
          resources,
        });
      })
    );
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.empireService.deleteMany({
      game: game._id,
    });
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.empireService.deleteMany({
      user: user._id,
    });
  }
}
