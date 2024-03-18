import {Injectable} from '@nestjs/common';
import {GameService} from '../game/game.service';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {GameDocument} from '../game/game.schema';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {System, SystemDocument} from '../system/system.schema';
import {calculateVariable, calculateVariables, getInitialVariables} from './variables';
import {Variable} from './types';
import {ResourceName} from './resources';
import {DistrictName, DISTRICTS} from './districts';
import {EMPIRE_VARIABLES} from './empire-variables';
import {BUILDINGS} from './buildings';
import {SYSTEM_UPGRADES, SystemUpgradeName} from './system-upgrade';
import {AggregateItem, AggregateResult} from './aggregates';

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
    await this.systemService.saveAll(systems);
    for (const game of games) {
      this.gameService.emit('ticked', game);
    }
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
    this.deductResource(empire, 'food', popUpkeep);

    // handle districts and buildings
    for (const system of systems) {
      if (system.upgrade === 'unexplored' || system.upgrade === 'explored') {
        continue;
      }

      const systemUpkeepPaid = this.deductSystemUpkeep(system.upgrade, empire, variables);
      if (!systemUpkeepPaid) {
        continue;
      }

      const jobs = Object.values(system.districts).sum() + system.buildings.length;
      const popCoverage = Math.clamp(system.population / jobs, 0, 1);

      for (const [districtType, count] of Object.entries(system.districts)) {
        const district = DISTRICTS[districtType as DistrictName];

        // deduct district upkeep
        let districtUpkeepPaid = true;
        for (const resource of Object.keys(district.upkeep)) {
          const variable = `districts.${districtType}.upkeep.${resource}` as Variable;
          districtUpkeepPaid = this.deductResource(empire, resource as ResourceName, variables[variable] * count * popCoverage) && districtUpkeepPaid;
        }

        if (!districtUpkeepPaid) {
          continue;
        }

        // add district production
        for (const resource of Object.keys(district.production)) {
          const variable = `districts.${districtType}.production.${resource}` as Variable;
          empire.resources[resource as ResourceName] += count * variables[variable] * popCoverage;
        }
      }

      for (const buildingType of system.buildings) {
        const building = BUILDINGS[buildingType];

        // deduct building upkeep
        let buildingUpkeepPaid = true;
        for (const resource of Object.keys(building.upkeep)) {
          const variable = `buildings.${buildingType}.upkeep.${resource}` as Variable;
          buildingUpkeepPaid = this.deductResource(empire, resource as ResourceName, variables[variable] * popCoverage) && buildingUpkeepPaid;
        }

        if (!buildingUpkeepPaid) {
          continue;
        }

        // add building production
        for (const resource of Object.keys(building.production)) {
          const variable = `buildings.${buildingType}.production.${resource}` as Variable;
          empire.resources[resource as ResourceName] += variables[variable] * popCoverage;
        }
      }
    }

    this.deductJoblessUpkeep(systems, empire, variables);

    // spawn pops on systems
    if (empire.resources.food) {
      this.popGrowth(systems, variables);
    }

    // ensure empire population is up to date
    empire.resources.population = systems.map(s => s.population).sum();

    empire.markModified('resources');
  }

  private deductJoblessUpkeep(systems: SystemDocument[], empire: EmpireDocument, variables: Record<Variable, number>) {
    const totalJobs = systems
      .map(s => Object.values(s.districts).sum() + s.buildings.length)
      .sum();
    const joblessPops = empire.resources.population - totalJobs;
    const joblessPopUpkeep = variables['empire.pop.consumption.credits.unemployed'] * joblessPops;
    this.deductResource(empire, 'credits', joblessPopUpkeep);
  }

  private deductSystemUpkeep(upgrade: 'colonized' | 'upgraded' | 'developed', empire: EmpireDocument, variables: Record<Variable, number>) {
    let systemUpkeepPaid = true;
    for (const resource of Object.keys(SYSTEM_UPGRADES[upgrade].upkeep)) {
      const variable = `systems.${upgrade}.upkeep.${resource}` as Variable;
      systemUpkeepPaid = this.deductResource(empire, resource as ResourceName, variables[variable]) && systemUpkeepPaid;
    }
    return systemUpkeepPaid;
  }

  private deductResource(empire: EmpireDocument, resource: ResourceName, amount: number) {
    if (empire.resources[resource] < amount) {
      empire.resources[resource] = 0;
      return false;
    } else {
      empire.resources[resource] -= amount;
      return true;
    }
  }

  private popGrowth(systems: SystemDocument[], variables: Record<Variable, number>) {
    for (const system of systems) {
      const {population, capacity} = system;
      const growthVariable: Variable = population >= capacity
        ? 'systems.developed.pop_growth'
        : `systems.${system.upgrade}.pop_growth`;
      system.population = variables[growthVariable] * population;
    }
  }

  aggregatePopGrowth(empire: Empire, systems: System[]): AggregateResult {
    let total = 0;
    const groupedItems: Partial<Record<SystemUpgradeName, AggregateItem>> = {};

    for (const system of systems) {
      const {population, capacity} = system;
      const effectiveUpgrade = population >= capacity ? 'developed' : system.upgrade;
      const item = groupedItems[effectiveUpgrade] ??= {
        id: effectiveUpgrade,
        count: 0,
        subtotal: 0,
        variable: `systems.${effectiveUpgrade}.pop_growth`,
      };
      const variable: Variable = `systems.${effectiveUpgrade}.pop_growth`;
      const value = calculateVariable(variable, empire);
      const systemGrowth = (value - 1) * population;
      item.count++;
      item.subtotal += systemGrowth;
      total += systemGrowth;
    }

    return {
      total,
      items: Object.values(groupedItems),
    };
  }

  aggregateResource(empire: Empire, systems: System[], resource: ResourceName): AggregateResult {
    const items: AggregateItem[] = [];
    const variables = getInitialVariables();
    calculateVariables(variables, empire);

    // + district production
    // + building production
    // - system upkeep
    // - district upkeep
    // - building upkeep
    // if food: - pop upkeep
    if (resource === 'food') {
      const popUpkeep = variables['empire.pop.consumption.food'] * empire.resources.population;
      items.push({
        id: 'pop_food_consumption',
        count: empire.resources.population,
        subtotal: -popUpkeep,
        variable: 'empire.pop.consumption.food',
      });
    }
    // if credits: - jobless pop upkeep
    if (resource === 'credits') {
      const totalJobs = systems.map(s => Object.values(s.districts).sum() + s.buildings.length).sum();
      const unemployedPops = empire.resources.population - totalJobs;
      const unemployedPopUpkeep = variables['empire.pop.consumption.credits.unemployed'] * unemployedPops;
      items.push({
        id: 'pop_unemployed_credits_cost',
        count: unemployedPops,
        subtotal: -unemployedPopUpkeep,
        variable: 'empire.pop.consumption.credits.unemployed',
      });
    }

    return {
      total: items.map(item => item.subtotal).sum(),
      items,
    };
  }
}
