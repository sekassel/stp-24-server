import {Injectable} from '@nestjs/common';
import {GameService} from '../game/game.service';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {GameDocument} from '../game/game.schema';
import {EmpireDocument} from '../empire/empire.schema';
import {SystemDocument} from '../system/system.schema';
import {calculateVariables, getInitialVariables} from './variables';

@Injectable()
export class GameLogicService {
  constructor(
    private gameService: GameService,
    private empireService: EmpireService,
    private systemService: SystemService,
  ) {
  }

  async updateGames() {
    const games = await this.gameService.findAll({started: true});
    const gameIds = games.map(game => game._id);
    const empires = await this.empireService.findAll({game: {$in: gameIds}});
    const systems = await this.systemService.findAll({game: {$in: gameIds}});
    for (const game of games) {
      const gameEmpires = empires.filter(empire => empire.game.equals(game._id));
      const gameSystems = systems.filter(system => system.game.equals(game._id));
      this.updateGame(game, gameEmpires, gameSystems);
    }
    await this.empireService.saveAll(empires);
  }

  private updateGame(game: GameDocument, empires: EmpireDocument[], systems: SystemDocument[]) {
    for (const empire of empires) {
      const empireSystems = systems.filter(system => system.owner?.equals(empire._id));
      this.updateEmpire(empire, empireSystems);
    }
  }

  private updateEmpire(empire: EmpireDocument, systems: SystemDocument[]) {
    const variables = getInitialVariables();
    calculateVariables(variables, empire);

    // deduct pop upkeep
    const popUpkeep = variables['empire.pop.consumption.food'] * empire.resources.population;
    empire.resources.food = Math.max(0, empire.resources.food - popUpkeep);

    // handle districts
    for (const system of systems) {
      for (const [districtType, count] of Object.entries(system.districts)) {

      }
    }

    // deduct jobless pop upkeep
    const totalJobs = systems.reduce((acc, system) => {
      acc += system.buildings.length;
      for (const count of Object.values(system.districts)) {
        acc += count;
      }
      return acc;
    }, 0);
    const joblessPop = empire.resources.population - totalJobs;
    const joblessPopUpkeep = variables['empire.pop.consumption.credits.unemployed'] * joblessPop;
    empire.resources.credits = Math.max(0, empire.resources.credits - joblessPopUpkeep);
  }
}
