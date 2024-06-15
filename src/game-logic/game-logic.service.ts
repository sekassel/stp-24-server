import {Injectable} from '@nestjs/common';
import {GameService} from '../game/game.service';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {System, SystemDocument} from '../system/system.schema';
import {calculateVariables, getInitialVariables} from './variables';
import {Technology, Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
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

  async updateGames(speed: number) {
    const games = await this.gameService.findAll({started: true, speed});
    const gameIds = games.map(game => game._id);
    const empires = await this.empireService.findAll({game: {$in: gameIds}});
    const systems = await this.systemService.findAll({game: {$in: gameIds}});
    for (const game of games) {
      game.$inc('period', 1);
      const gameEmpires = empires.filter(empire => empire.game.equals(game._id));
      const gameSystems = systems.filter(system => system.game.equals(game._id));
      this.updateGame(gameEmpires, gameSystems);
    }
    await this.empireService.saveAll(empires);
    await this.systemService.saveAll(systems);
    await this.gameService.saveAll(games);
    for (const game of games) {
      this.gameService.emit('ticked', game);
    }
  }

  private updateGame(empires: EmpireDocument[], systems: SystemDocument[]) {
    for (const empire of empires) {
      const empireSystems = systems.filter(system => system.owner?.equals(empire._id));
      this.updateEmpire(empire, empireSystems);
    }
  }

  private updateEmpire(empire: EmpireDocument, systems: SystemDocument[], aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    const variables = getInitialVariables();
    calculateVariables(variables, empire);

    // handle districts and buildings
    for (const system of systems) {
      if (system.upgrade === 'unexplored' || system.upgrade === 'explored') {
        continue;
      }

      let systemVariables = variables;
      if (system.effects?.length) {
        // this system has custom effects, we need to re-run the variable calculations
        // (just applying the system effects on top of the empire effects messes up the order of operations)
        systemVariables = getInitialVariables();
        calculateVariables(systemVariables, empire, system);
      }

      const popUpkeepPaid = this.deductPopUpkeep(system, empire, systemVariables, aggregates);

      const systemUpkeepPaid = this.deductSystemUpkeep(system.upgrade, empire, systemVariables, aggregates);

      const jobs = this.getJobs(system);
      const popCoverage = Math.clamp(system.population / jobs, 0, 1);

      this.processDistricts(system, systemUpkeepPaid, popCoverage, empire, systemVariables, aggregates);
      this.processBuildings(system, systemUpkeepPaid, popCoverage, empire, systemVariables, aggregates);

      this.deductJoblessUpkeep(system, empire, systemVariables, aggregates);

      if (popUpkeepPaid) {
        this.popGrowth(system, systemVariables, aggregates);
      }
    }

    this.migratePopulation(systems);

    // ensure empire population is up to date
    empire.resources.population = systems.map(s => s.population).sum();

    empire.markModified('resources');
  }

  private getJobs(system: SystemDocument): number {
    return Object.values(system.districts).sum() + system.buildings.length;
  }

  private updateAggregate(aggregate: AggregateResult | undefined, variable: Variable, count: number, subtotal: number) {
    if (!aggregate) {
      return;
    }
    const item = aggregate.items.find(item => item.variable === variable);
    if (item) {
      item.count += count;
      item.subtotal += subtotal;
    } else {
      aggregate.items.push({variable, count, subtotal});
    }
    aggregate.total += subtotal;
  }

  private deductPopUpkeep(system: SystemDocument, empire: EmpireDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>): boolean {
    // TODO allow custom variables to define other pop upkeep costs
    const popUpkeep = variables['empire.pop.consumption.food'] * system.population;
    this.updateAggregate(aggregates?.food, 'empire.pop.consumption.food', system.population, -popUpkeep);
    return this.deductResource(empire, 'food', popUpkeep);
  }

  private processDistricts(system: SystemDocument, systemUpkeepPaid: boolean, popCoverage: number, empire: EmpireDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    for (const [districtType, count] of Object.entries(system.districts)) {
      const upkeepMultiplier = (systemUpkeepPaid ? 1 : 0.75) * count * popCoverage;

      // deduct district upkeep
      let districtUpkeepPaid = true;
      for (const resource of RESOURCE_NAMES) {
        const variable = `districts.${districtType}.upkeep.${resource}` as Variable;
        if (variable in variables) {
          const amount = variables[variable] * upkeepMultiplier;
          this.updateAggregate(aggregates?.[resource], variable, count, -amount);
          districtUpkeepPaid = this.deductResource(empire, resource, amount) && districtUpkeepPaid;
        }
      }

      const productionMultiplier = (districtUpkeepPaid ? 1 : 0.75) * (systemUpkeepPaid ? 1 : 0.75) * count * popCoverage;

      // add district production
      for (const resource of RESOURCE_NAMES) {
        const variable = `districts.${districtType}.production.${resource}` as Variable;
        if (variable in variables) {
          const amount = variables[variable] * productionMultiplier;
          this.updateAggregate(aggregates?.[resource], variable, count, amount);
          empire.resources[resource] += amount;
        }
      }
    }
  }

  private processBuildings(system: SystemDocument, systemUpkeepPaid: boolean, popCoverage: number, empire: EmpireDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    for (const buildingType of system.buildings) {
      const upkeepMultiplier = (systemUpkeepPaid ? 1 : 0.75) * popCoverage;

      // deduct building upkeep
      let buildingUpkeepPaid = true;
      for (const resource of RESOURCE_NAMES) {
        const variable = `buildings.${buildingType}.upkeep.${resource}` as Variable;
        if (variable in variables) {
          const amount = variables[variable] * upkeepMultiplier;
          this.updateAggregate(aggregates?.[resource], variable, 1, -amount);
          buildingUpkeepPaid = this.deductResource(empire, resource, amount) && buildingUpkeepPaid;
        }
      }

      const productionMultiplier = (buildingUpkeepPaid ? 1 : 0.75) * (systemUpkeepPaid ? 1 : 0.75) * popCoverage;

      // add building production
      for (const resource of RESOURCE_NAMES) {
        const variable = `buildings.${buildingType}.production.${resource}` as Variable;
        if (variable in variables) {
          const amount = variables[variable] * productionMultiplier;
          this.updateAggregate(aggregates?.[resource as ResourceName], variable, 1, amount);
          empire.resources[resource as ResourceName] += amount;
        }
      }
    }
  }

  private deductJoblessUpkeep(system: SystemDocument, empire: EmpireDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    // TODO allow custom variables to define other jobless upkeep costs
    const totalJobs = this.getJobs(system);
    const joblessPops = system.population - totalJobs;
    const variable = 'empire.pop.consumption.credits.unemployed';
    const joblessPopUpkeep = variables[variable] * joblessPops;
    this.updateAggregate(aggregates?.credits, variable, joblessPops, -joblessPopUpkeep);
    this.deductResource(empire, 'credits', joblessPopUpkeep);
  }

  private deductSystemUpkeep(upgrade: 'colonized' | 'upgraded' | 'developed', empire: EmpireDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    let systemUpkeepPaid = true;
    for (const resource of RESOURCE_NAMES) {
      const variable = `systems.${upgrade}.upkeep.${resource}` as Variable;
      if (variable in variables) {
        const amount = variables[variable];
        this.updateAggregate(aggregates?.[resource], variable, 1, -amount);
        systemUpkeepPaid = this.deductResource(empire, resource, amount) && systemUpkeepPaid;
      }
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

  private migratePopulation(systems: SystemDocument[]) {
    const migrationSources = systems.filter(s => s.population > this.getJobs(s));
    const migrationTargets = systems.filter(s => s.population < this.getJobs(s));

    // how many pops can migrate
    const totalMigration = migrationSources.map(s => s.population - this.getJobs(s)).sum();
    // how many pops can be accepted
    const totalCapacity = migrationTargets.map(s => this.getJobs(s) - s.population).sum();
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

    // console.log(`----- Migrating ${migratingPops} pops -----`);

    for (const system of migrationSources) {
      const jobs = this.getJobs(system);
      const migrationFraction = (system.population - jobs) / totalMigration;
      const migrationAmount = migratingPops * migrationFraction;
      system.population -= migrationAmount;
      // console.log(`Migrating from ${system.id}: (${system.population}-${jobs})/${totalMigration} * ${migratingPops} = ${migrationAmount}`);
    }

    for (const system of migrationTargets) {
      const jobs = this.getJobs(system);
      const migrationFraction = (jobs - system.population) / totalCapacity;
      const migrationAmount = migratingPops * migrationFraction;
      system.population += migrationAmount;
      // console.log(`Migrating to ${system.id}: (${jobs}-${system.population})/${totalCapacity} * ${migratingPops} = ${migrationAmount}`);
    }
  }

  private popGrowth(system: SystemDocument, variables: Record<Variable, number>, aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
    const {population, capacity} = system;
    const growthVariable: Variable = `systems.${system.upgrade}.pop_growth`;
    const growthRate = variables[growthVariable];
    const growth = growthRate * population * Math.clamp(1 - population / capacity, 0, 1); // logistic growth
    this.updateAggregate(aggregates?.population, growthVariable, 1, growth);
    system.population = population + growth;
  }

  aggregateResources(empire: Empire, systems: System[], resources: ResourceName[]): AggregateResult[] {
    const aggregates: Partial<Record<ResourceName, AggregateResult>> = Object.fromEntries(resources.map(r => [r, {total: 0, items: []}]));
    this.updateEmpire(empire as EmpireDocument, systems as SystemDocument[], aggregates); // NB: this mutates empire and systems, but does not save them.
    return resources.map(r => aggregates[r]!);
  }

  aggregateAllResources(empire: Empire, systems: System[]): AggregateResult {
    const initial = {
      ...empire.resources,
      // NB: This is necessary for single-system queries,
      // where empire.resources.population starts at the whole population and is then reduced by the system's population
      // which would result in a very negative population delta.
      population: systems.map(s => s.population).sum(),
    };
    this.updateEmpire(empire as EmpireDocument, systems as SystemDocument[]);
    // FIXME migration will never be accounted for
    //   - when querying all systems, migration is zero across them (since it's zero-sum)
    //   - when querying a single system, migration cannot happen
    const items = Object.entries(empire.resources).map(([resource, value]) => ({
      variable: `resources.${resource}.periodic`,
      count: 1,
      subtotal: value - initial[resource as ResourceName],
    }));
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
      subtotal: spentResearch,
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
      total: Math.log2(compareResult.total / base.total),
      items: [],
    };
  }

  private summarizeResources(empire: Empire, systems: System[], resources: [ResourceName, number][]) {
    const items: AggregateItem[] = [];
    const production = this.aggregateResources(empire, systems, resources.map(r => r[0]));
    for (let i = 0; i < resources.length; i++) {
      const [resource, weight] = resources[i];
      items.push({
        variable: `resources.${resource}.periodic`,
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
