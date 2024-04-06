import {Injectable} from '@nestjs/common';
import {GameService} from '../game/game.service';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {GameDocument} from '../game/game.schema';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {System, SystemDocument} from '../system/system.schema';
import {calculateVariable, calculateVariables, getInitialVariables} from './variables';
import {Technology, Variable} from './types';
import {ResourceName} from './resources';
import {DistrictName, DISTRICTS} from './districts';
import {BUILDINGS} from './buildings';
import {SYSTEM_UPGRADES, SystemUpgradeName} from './system-upgrade';
import {AggregateItem, AggregateResult} from './aggregates';
import {TECHNOLOGIES} from './technologies';
import {Types} from 'mongoose';
import {notFound} from '@mean-stream/nestx';

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

      const jobs = Object.values(system.districts).sum() + system.buildings.length;
      const popCoverage = Math.clamp(system.population / jobs, 0, 1);

      for (const [districtType, count] of Object.entries(system.districts)) {
        const district = DISTRICTS[districtType as DistrictName];

        const upkeepMultiplier = (systemUpkeepPaid ? 1 : 0.75) * count * popCoverage;

        // deduct district upkeep
        let districtUpkeepPaid = true;
        for (const resource of Object.keys(district.upkeep)) {
          const variable = `districts.${districtType}.upkeep.${resource}` as Variable;
          districtUpkeepPaid = this.deductResource(empire, resource as ResourceName, variables[variable] * upkeepMultiplier) && districtUpkeepPaid;
        }

        const productionMultiplier = (districtUpkeepPaid ? 1 : 0.75) * (systemUpkeepPaid ? 1 : 0.75) * count * popCoverage;

        // add district production
        for (const resource of Object.keys(district.production)) {
          const variable = `districts.${districtType}.production.${resource}` as Variable;
          empire.resources[resource as ResourceName] += variables[variable] * productionMultiplier;
        }
      }

      for (const buildingType of system.buildings) {
        const building = BUILDINGS[buildingType];

        const upkeepMultiplier = (systemUpkeepPaid ? 1 : 0.75) * popCoverage;

        // deduct building upkeep
        let buildingUpkeepPaid = true;
        for (const resource of Object.keys(building.upkeep)) {
          const variable = `buildings.${buildingType}.upkeep.${resource}` as Variable;
          buildingUpkeepPaid = this.deductResource(empire, resource as ResourceName, variables[variable] * upkeepMultiplier) && buildingUpkeepPaid;
        }

        const productionMultiplier = (buildingUpkeepPaid ? 1 : 0.75) * (systemUpkeepPaid ? 1 : 0.75) * popCoverage;

        // add building production
        for (const resource of Object.keys(building.production)) {
          const variable = `buildings.${buildingType}.production.${resource}` as Variable;
          empire.resources[resource as ResourceName] += variables[variable] * productionMultiplier;
        }
      }
    }

    this.deductJoblessUpkeep(systems, empire, variables);

    // spawn pops on systems
    if (empire.resources.food) {
      this.popGrowth(systems, variables);
    }

    this.migratePopulation(systems, empire);

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

  private migratePopulation(systems: SystemDocument[], empire: EmpireDocument) {
    const migrationSources = systems.filter(s => s.population > s.capacity);
    const migrationTargets = systems.filter(s => s.population < s.capacity);

    // how many pops can migrate
    const totalMigration = migrationSources.map(s => s.population - s.capacity).sum();
    // how many pops can be accepted
    const totalCapacity = migrationTargets.map(s => s.capacity - s.population).sum();
    const migratingPops = Math.min(totalMigration, totalCapacity) * 0.1;
    if (!migratingPops) {
      return;
    }

    // lets say there are 4 systems:
    // A: 20/30
    // B: 25/30
    // C: 40/30
    // D: 50/30
    // totalMigration should be (40-30) + (50-30) = 10 + 20 = 30
    // totalCapacity should be (30-20) + (30-25) = 10 + 5 = 15
    // so we can only migrate 15 pops
    // C should lose (40-30) / 30 * 15 = 5 pops
    // D should lose (50-30) / 30 * 15 = 10 pops
    // A should gain (30-20) / 15 * 15 = 10 pops
    // B should gain (30-25) / 15 * 15 = 5 pops

    console.log(`----- Migrating ${migratingPops} pops -----`);

    for (const system of migrationSources) {
      const migrationFraction = (system.population - system.capacity) / totalMigration;
      const migrationAmount = migratingPops * migrationFraction;
      system.population -= migrationAmount;
      console.log(`Migrating from ${system.id}: (${system.population}-${system.capacity})/${totalMigration} * ${migratingPops} = ${migrationAmount}`);
    }

    for (const system of migrationTargets) {
      const migrationFraction = (system.capacity - system.population) / totalCapacity;
      const migrationAmount = migratingPops * migrationFraction;
      system.population += migrationAmount;
      console.log(`Migrating to ${system.id}: (${system.capacity}-${system.population})/${totalCapacity} * ${migratingPops} = ${migrationAmount}`);
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

  aggregateResources(empire: Empire, systems: System[], resources: ResourceName[]): AggregateResult[] {
    const variables = getInitialVariables();
    calculateVariables(variables, empire);
    return resources.map(resource => this.aggregateResource(empire, systems, resource, variables));
  }

  aggregateResource(empire: Empire, systems: System[], resource: ResourceName, variables: Record<Variable, number>): AggregateResult {
    const items: AggregateItem[] = [];

    // - system upkeep
    for (const systemType of Object.values(SYSTEM_UPGRADES)) {
      if (resource in systemType.upkeep) {
        const count = systems.filter(s => s.upgrade === systemType.id).length;
        const variable = `systems.${systemType.id}.upkeep.${resource}` as Variable;
        items.push({
          variable,
          count: count,
          subtotal: -variables[variable] * count,
        });
      }
    }

    for (const district of Object.values(DISTRICTS)) {
      const count = systems.map(s => s.districts[district.id] ?? 0).sum();
      // + district production
      if (resource in district.production) {
        const variable = `districts.${district.id}.production.${resource}` as Variable;
        items.push({
          variable,
          count,
          subtotal: variables[variable] * count,
        });
      }
      // - district upkeep
      if (resource in district.upkeep) {
        const variable = `districts.${district.id}.upkeep.${resource}` as Variable;
        items.push({
          variable,
          count,
          subtotal: -variables[variable] * count,
        });
      }
    }
    const allBuildings = systems.flatMap(s => s.buildings);
    for (const building of Object.values(BUILDINGS)) {
      const count = allBuildings.filter(b => b === building.id).length;
      // + building production
      if (resource in building.production) {
        const variable = `buildings.${building.id}.production.${resource}` as Variable;
        items.push({
          variable,
          count,
          subtotal: variables[variable] * count,
        });
      }
      // - building upkeep
      if (resource in building.upkeep) {
        const variable = `buildings.${building.id}.upkeep.${resource}` as Variable;
        items.push({
          variable,
          count,
          subtotal: -variables[variable] * count,
        });
      }
    }

    // if food: - pop upkeep
    const systemsPopulation = systems.map(s => s.population).sum();
    if (resource === 'food') {
      const popUpkeep = variables['empire.pop.consumption.food'] * systemsPopulation;
      items.push({
        variable: 'empire.pop.consumption.food',
        count: empire.resources.population,
        subtotal: -popUpkeep,
      });
    }
    // if credits: - jobless pop upkeep
    if (resource === 'credits') {
      const totalJobs = systems.map(s => Object.values(s.districts).sum() + s.buildings.length).sum();
      const unemployedPops = systemsPopulation - totalJobs;
      const unemployedPopUpkeep = variables['empire.pop.consumption.credits.unemployed'] * unemployedPops;
      items.push({
        variable: 'empire.pop.consumption.credits.unemployed',
        count: unemployedPops,
        subtotal: -unemployedPopUpkeep,
      });
    }

    return {
      total: items.map(item => item.subtotal).sum(),
      items,
    };
  }

  async aggregateTechCost(empire: Empire, technology: Technology): Promise<AggregateResult> {
    return this.empireService.aggregateTechCost(empire, technology);
  }

  aggregateEconomy(empire: Empire, systems: System[]): AggregateResult {
    const items = this.summarizeResources(empire, systems, [
      ['credits', 2],
      ['energy', 1],
      ['minerals', 1],
      ['food', 1],
      ['alloys', 4],
      ['fuel', 3],
    ]);
    return {
      total: items.map(item => item.subtotal).sum(),
      items,
    };
  }

  aggregateMilitary(empire: Empire, systems: System[]): AggregateResult {
    const items = this.summarizeResources(empire, systems, [
      ['credits', 1],
      ['alloys', 2],
      ['fuel', 1],
    ]);
    // TODO consider active fleets
    return {
      total: items.map(item => item.subtotal).sum(),
      items,
    };
  }

  aggregateTechnology(empire: Empire, systems: System[]): AggregateResult {
    const items = this.summarizeResources(empire, systems, [
      ['research', 1],
    ]);
    const spentResearch = empire.technologies.map(t => TECHNOLOGIES[t]?.cost ?? 0).sum();
    items.push({
      variable: 'technologies.unlocked',
      count: empire.technologies.length,
      subtotal: spentResearch / 100,
    });
    return {
      total: items.map(item => item.subtotal).sum(),
      items,
    };
  }

  async compare(empire: Empire, systems: System[], compare: string, fn: (empire: Empire, systems: System[]) => AggregateResult): Promise<AggregateResult> {
    const compareId = new Types.ObjectId(compare);
    const [compareEmpire, compareSystems] = await Promise.all([
      this.empireService.find(compareId),
      this.systemService.findAll({owner: compareId}),
    ]);
    if (!compareEmpire) {
      notFound(`Empire ${compare}`);
    }
    const base = fn(empire, systems);
    const compareResult = fn(compareEmpire, compareSystems);
    return {
      total: Math.log2(base.total / compareResult.total),
      items: [],
    };
  }

  private summarizeResources(empire: Empire, systems: System[], resources: [ResourceName, number][]) {
    const items: AggregateItem[] = [];
    const production = this.aggregateResources(empire, systems, resources.map(r => r[0]));
    for (let i = 0; i < resources.length; i++) {
      const [resource, weight] = resources[i];
      items.push({
        variable: `resources.${resource}.production`,
        count: weight,
        subtotal: production[i].total,
      });
      items.push({
        variable: `resources.${resource}.stored`,
        count: weight,
        subtotal: empire.resources[resource as ResourceName],
      });
    }
    return items;
  }
}
