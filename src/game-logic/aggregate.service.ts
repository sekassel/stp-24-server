import {Injectable} from '@nestjs/common';
import {Empire, EmpireDocument} from '../empire/empire.schema';
import {System, SystemDocument} from '../system/system.schema';
import {ResourceName} from './resources';
import {AggregateItem, AggregateResult} from './aggregates';
import {Technology} from './types';
import {TECHNOLOGIES} from './technologies';
import {Types} from 'mongoose';
import {notFound} from '@mean-stream/nestx';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {GameLogicService} from './game-logic.service';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {SystemLogicService} from '../system/system-logic.service';
import {Ship} from '../ship/ship.schema';
import {ShipService} from '../ship/ship.service';

@Injectable()
export class AggregateService {
  constructor(
    private readonly empireService: EmpireService,
    private readonly systemService: SystemService,
    private readonly shipService: ShipService,
    private readonly gameLogicService: GameLogicService,
    private readonly empireLogicService: EmpireLogicService,
    private readonly systemLogicService: SystemLogicService,
  ) {
  }

  async aggregateResourcesPeriodic(empire: Empire, system?: string, resource?: ResourceName): Promise<AggregateResult> {
    const systems = system
      ? [await this.systemService.find(new Types.ObjectId(system)) ?? notFound(system)]
      : await this.systemService.findAll({owner: empire._id});
    const ships = system ? [] : await this.shipService.findAll({empire: empire._id});
    if (resource) {
      return this.aggregateResources(empire, systems, ships, [resource])[0];
    } else {
      return this.aggregateAllResources(empire, systems, ships);
    }
  }

  aggregateResources(empire: Empire, systems: System[], ships: Ship[], resources: ResourceName[]): AggregateResult[] {
    const aggregates: Partial<Record<ResourceName, AggregateResult>> = Object.fromEntries(resources.map(r => [r, {
      total: 0,
      items: [],
    }]));
    this.gameLogicService.updateEmpire(empire as EmpireDocument, systems as SystemDocument[], ships, aggregates); // NB: this mutates empire and systems, but does not save them.
    return resources.map(r => aggregates[r]!);
  }

  aggregateAllResources(empire: Empire, systems: System[], ships: Ship[]): AggregateResult {
    const initial = {
      ...empire.resources,
      // NB: This is necessary for single-system queries,
      // where empire.resources.population starts at the whole population and is then reduced by the system's population
      // which would result in a very negative population delta.
      population: systems.map(s => s.population).sum(),
    };
    this.gameLogicService.updateEmpire(empire as EmpireDocument, systems as SystemDocument[], ships);
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

  aggregateTechCost(empire: Empire, technology: Technology): AggregateResult {
    const aggregate: AggregateResult = {items: [], total: 0};
    this.empireLogicService.getTechnologyCost(empire, technology, aggregate);
    return aggregate;
  }

  aggregateTechTime(empire: Empire, technology: Technology): AggregateResult {
    const aggregate: AggregateResult = {items: [], total: 0};
    this.empireLogicService.getTechnologyTime(empire, technology, aggregate);
    return aggregate;
  }

  async aggregateSystemHealthOrDefense(empire: Empire, system: string, which: 'health' | 'defense'): Promise<AggregateResult> {
    const systemDoc = await this.systemService.find(new Types.ObjectId(system)) ?? notFound(system);
    const aggregate: AggregateResult = {items: [], total: 0};
    this.systemLogicService.maxHealthOrDefense(systemDoc, empire, which, undefined, aggregate);
    return aggregate;
  }

  async aggregateEconomy(empire: Empire): Promise<AggregateResult> {
    const systems = await this.systemService.findAll({owner: empire._id});
    const ships = await this.shipService.findAll({empire: empire._id});
    const items = this.summarizeResources(empire, systems, ships, [
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

  async aggregateMilitary(empire: Empire): Promise<AggregateResult> {
    const systems = await this.systemService.findAll({owner: empire._id});
    const ships = await this.shipService.findAll({empire: empire._id});
    const items = this.summarizeResources(empire, systems, ships, [
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

  async aggregateTechnology(empire: Empire): Promise<AggregateResult> {
    const systems = await this.systemService.findAll({owner: empire._id});
    // Don't load ships, they are irrelevant for technology
    const items = this.summarizeResources(empire, systems, [], [
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

  async compare(empire: Empire, compare: string, fn: (empire: Empire) => Promise<AggregateResult>): Promise<AggregateResult> {
    const compareEmpire = await this.empireService.find(new Types.ObjectId(compare)) ?? notFound(`Empire to compare: ${compare}`);
    const base = await fn(empire);
    const compareResult = await fn(compareEmpire);
    return {
      total: Math.log2(compareResult.total / base.total),
      items: [],
    };
  }

  private summarizeResources(empire: Empire, systems: System[], ships: Ship[], resources: [ResourceName, number][]) {
    const items: AggregateItem[] = [];
    const production = this.aggregateResources(empire, systems, ships, resources.map(r => r[0]));
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
