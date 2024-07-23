import {Injectable} from '@nestjs/common';
import {EmpireService} from '../empire/empire.service';
import {SystemService} from '../system/system.service';
import {EmpireDocument} from '../empire/empire.schema';
import {SystemDocument} from '../system/system.schema';
import {calculateVariables, EmpireEffectSources, getInitialVariables, getVariables} from './variables';
import {Variable} from './types';
import {RESOURCE_NAMES, ResourceName} from './resources';
import {AggregateResult} from './aggregates';
import {Game} from '../game/game.schema';
import {HOMESYSTEM_BUILDINGS, HOMESYSTEM_DISTRICT_COUNT, HOMESYSTEM_DISTRICTS} from './constants';
import {MemberService} from '../member/member.service';
import {SYSTEM_UPGRADES} from './system-upgrade';
import {JobService} from '../job/job.service';
import {JobDocument} from '../job/job.schema';
import {SystemLogicService} from '../system/system-logic.service';
import {FleetService} from '../fleet/fleet.service';
import {ShipService} from '../ship/ship.service';
import {FleetDocument} from '../fleet/fleet.schema';
import {WarService} from '../war/war.service';
import {ShipDocument} from '../ship/ship.schema';
import {War, WarDocument} from '../war/war.schema';
import {Types} from 'mongoose';

@Injectable()
export class GameLogicService {
  constructor(
    private systemLogicService: SystemLogicService,
    // TODO remove these services and try to have only pure logic in this service
    private memberService: MemberService,
    private empireService: EmpireService,
    private systemService: SystemService,
    private fleetService: FleetService,
    private shipService: ShipService,
    private warService: WarService,
    private jobService: JobService,
  ) {
  }

  async startGame(game: Game): Promise<void> {
    const members = await this.memberService.findAll({
      game: game._id,
      empire: {$exists: true},
    });
    const empires = await this.empireService.initEmpires(members);
    const systems = await this.systemService.generateMap(game);
    const homeSystems = new Set<string>();

    // select a home system for each empire
    for (const empire of empires) { // NB: cannot be indexed because some members may not have empires (spectators)
      const member = members.find(m => empire.user.equals(m.user));
      const homeSystem = this.selectHomeSystem(systems, homeSystems);

      homeSystem.owner = empire._id;
      homeSystem.population = empire.resources.population;
      homeSystem.upgrade = 'upgraded';
      homeSystem.capacity *= SYSTEM_UPGRADES.upgraded.capacity_multiplier;
      if (member?.empire?.homeSystem) {
        homeSystem.type = member.empire.homeSystem;
      }
      this.systemLogicService.generateDistricts(homeSystem, empire);

      // every home system starts with 15 districts
      this.generateDistricts(homeSystem);

      // plus 8 buildings, so 23 jobs in total
      homeSystem.buildings = HOMESYSTEM_BUILDINGS;

      const totalJobs = Object.values(homeSystem.districts).sum() + homeSystem.buildings.length;
      if (homeSystem.capacity < totalJobs) {
        homeSystem.capacity = totalJobs;
      }

      // then 3 pops will be unemployed initially.
      empire.homeSystem = homeSystem._id;
    }

    const fleets = await this.fleetService.generateFleets(empires);
    await this.shipService.createShips(fleets);

    const rogueFleets = await this.fleetService.generateRogueFleets(game, systems.filter(s => !homeSystems.has(s._id.toString())));
    await this.shipService.createShips(rogueFleets);

    await this.empireService.saveAll(empires);
    await this.systemService.saveAll(systems);
  }

  private selectHomeSystem(systems: SystemDocument[], homeSystems: Set<string>) {
    let homeSystem: SystemDocument;
    do {
      homeSystem = systems.random();
    } while (
      homeSystems.has(homeSystem._id.toString())
      || Object.keys(homeSystem.links).some(link => homeSystems.has(link))
      );
    homeSystems.add(homeSystem._id.toString());
    return homeSystem;
  }

  private generateDistricts(homeSystem: SystemDocument) {
    for (const district of HOMESYSTEM_DISTRICTS) {
      homeSystem.districts[district] = HOMESYSTEM_DISTRICT_COUNT;
      if (!homeSystem.districtSlots[district] || homeSystem.districtSlots[district]! < HOMESYSTEM_DISTRICT_COUNT) {
        homeSystem.districtSlots[district] = HOMESYSTEM_DISTRICT_COUNT;
        homeSystem.markModified('districtSlots');
      }
    }
    homeSystem.markModified('districts');
  }

  async updateGame(game: Game) {
    const empires = await this.empireService.findAll({game: game._id});
    const systems = await this.systemService.findAll({game: game._id});
    const wars = await this.warService.findAll({game: game._id});
    // TODO Optimize the fleet filter.
    //  We are only interested in fleets that are at war with another fleet or system,
    //  or fleets that are located in their owner's systems with shipyards for healing.
    //  (The fleets are not the problem, but the potentially large amount of ships they contain.)
    // The first condition in SQL:
    //  SELECT * FROM fleets as attacker, wars as war, fleets as defender WHERE attacker.owner = war.attacker AND defender.owner = war.defender
    // The second condition in SQL:
    //  SELECT * FROM fleets as fleet, systems as system WHERE fleet.owner = system.owner AND 'building' IN system.buildings
    const fleets = await this.fleetService.findAll({game: game._id});
    const ships = await this.shipService.findAll({fleet: {$in: fleets.map(f => f._id)}});

    await this.jobService.deleteMany({game: game._id, $expr: {$gte: ['$progress', '$total']}});
    const jobs = await this.jobService.findAll({game: game._id}, {sort: {priority: 1, createdAt: 1}});
    await this.updateEmpires(empires, systems, jobs);
    await this.updateFleetsAtWar(empires, systems, fleets, ships, wars);
    await this.healFleets(empires, systems, fleets, ships);

    await this.empireService.saveAll(empires);
    await this.systemService.saveAll(systems);
    await this.jobService.saveAll(jobs);
    await this.shipService.saveAll(ships);
  }

  private async updateEmpires(empires: EmpireDocument[], systems: SystemDocument[], jobs: JobDocument[]) {
    for (const empire of empires) {
      const empireSystems = systems.filter(system => system.owner?.equals(empire._id));
      const empireJobs = jobs.filter(job => job.empire.equals(empire._id));
      await this.jobService.updateJobs(empire, empireJobs, systems);
      this.updateEmpire(empire, empireSystems);
    }
  }

  updateEmpire(empire: EmpireDocument, systems: SystemDocument[], aggregates?: Partial<Record<ResourceName, AggregateResult>>) {
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
    let popUpkeepPaid = true;
    for (const resource of RESOURCE_NAMES) {
      const variable = `empire.pop.consumption.${resource}` as Variable;
      const upkeep = variables[variable];
      if (upkeep) {
        const popUpkeep = upkeep * system.population;
        this.updateAggregate(aggregates?.food, variable, system.population, -popUpkeep);
        popUpkeepPaid = this.deductResource(empire, 'food', popUpkeep) && popUpkeepPaid;
      }
    }
    return popUpkeepPaid;
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
    const totalJobs = this.getJobs(system);
    const joblessPops = system.population - totalJobs;
    for (const resource of RESOURCE_NAMES) {
      const variable = `empire.pop.unemployed_upkeep.${resource}` as Variable;
      const upkeep = variables[variable];
      if (upkeep) {
        const joblessPopUpkeep = upkeep * joblessPops;
        this.updateAggregate(aggregates?.credits, variable, joblessPops, -joblessPopUpkeep);
        this.deductResource(empire, 'credits', joblessPopUpkeep);
      }
    }
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
    if (!capacity) {
      // Growth calculation will yield NaN. This is probably an uninhabitable system, so just do nothing.
      return;
    }
    const growthVariable: Variable = `systems.${system.upgrade}.pop_growth`;
    const growthRate = variables[growthVariable];
    const growth = growthRate * population * Math.clamp(1 - population / capacity, 0, 1); // logistic growth
    this.updateAggregate(aggregates?.population, growthVariable, 1, growth);
    system.population = population + growth;
  }

  private async updateFleetsAtWar(empires: EmpireDocument[], systems: SystemDocument[], fleets: FleetDocument[], ships: ShipDocument[], wars: WarDocument[]) {
    const groupedBySystem = fleets.reduce<Record<string, FleetDocument[]>>((acc, fleet) => {
      (acc[fleet.location.toString()] ??= []).push(fleet);
      return acc;
    }, {});

    // Calculate ship variables for each empire
    const empireVariables: Record<string, Partial<Record<Variable, number>>> = {};
    for (const empire of empires) {
      const shipVariables = getVariables('ships');
      calculateVariables(shipVariables, empire);
      empireVariables[empire._id.toString()] = shipVariables;
    }

    // Calculate ship variables for each fleet either by reusing the empire's variables or by calculating them from the fleet's effects.
    const fleetVariables: Record<string, Partial<Record<Variable, number>>> = {};
    for (const fleet of fleets) {
      if (!fleet.effects && fleet.empire) {
        fleetVariables[fleet._id.toString()] = empireVariables[fleet.empire.toString()];
        continue;
      }
      const shipVariables = getVariables('ships');
      const empire: EmpireEffectSources = fleet.empire && empires.find(e => e._id.equals(fleet.empire)) || {
        // Rogue fleets need a dummy empire to calculate their variables
        effects: [],
        technologies: [],
        traits: [],
      };
      calculateVariables(shipVariables, empire, fleet);
      fleetVariables[fleet._id.toString()] = shipVariables;
    }

    // Pre-calculate the defense of each system
    const systemDefense: Record<string, number> = {};
    for (const system of systems) {
      const empire = system.owner && empires.find(e => e._id.equals(system.owner));
      if (empire) {
        systemDefense[system._id.toString()] = this.systemLogicService.maxHealthOrDefense(system, empire, 'defense');
      }
    }

    for (const [systemId, fleets] of Object.entries(groupedBySystem)) {
      const shipsInSystem = ships.filter(s => fleets.some(f => f._id.equals(s.fleet)));

      // Ships with greater speed attack first
      shipsInSystem.sortBy(s => {
        return -(fleetVariables[s.fleet.toString()][`ships.${s.type}.speed`] ?? 0); // descending order
      });

      for (const ship of shipsInSystem) {
        if (!ship.health) {
          // If B falls to 0 HP, it does not attack and is deleted.
          continue;
        }

        // At each period, each ship (A) picks one other ship (B) to attack (such that the damage is greatest)
        const {bestShip, bestDamage} = this.findBestShipToAttack(shipsInSystem, ship, wars, fleetVariables);

        if (bestShip) {
          // The damage is deducted from B.health and added to A.experience
          bestShip.health -= bestDamage;
          ship.experience += bestDamage;
          if (bestShip.health < 0) {
            bestShip.health = 0;
          }
        } else {
          // If the defender has no (remaining) fleets in the system, the system is attacked.
          const system = systems.find(s => s._id.equals(systemId));
          if (!system || !system.owner || system.owner.equals(ship.empire)) {
            // Unowned systems are never attacked.
            continue;
          }

          const shipVariables = fleetVariables[ship.fleet.toString()];
          const attack = shipVariables[`ships.${ship.type}.damage.system` as Variable] ?? shipVariables[`ships.${ship.type}.damage.default` as Variable] ?? 0;
          const defense = systemDefense[systemId] ?? 1;
          // The damage is calculated using A.attack.system / system.defense + log(A.experience)
          const damage = Math.max(attack / defense + Math.log(ship.experience), 0);
          system.health -= damage;
          if (system.health <= 0) {
            system.health = 0;
            // If the system falls to 0 HP, the owner changes to the attacker.
            system.owner = ship.empire;
          }
        }
      }
    }
  }

  private findBestShipToAttack(shipsInSystem: ShipDocument[], ship: ShipDocument, wars: WarDocument[], fleetVariables: Record<string, Partial<Record<Variable, number>>>) {
    let bestShip: ShipDocument | undefined;
    let bestDamage = 0;
    for (const otherShip of shipsInSystem) {
      if (!otherShip.health) {
        // ignore destroyed ships
        continue;
      }
      // ignore friendly ships
      if (ship.fleet.equals(otherShip.fleet)) {
        continue;
      }
      // Unowned/rogue fleets always attack.
      if (ship.empire && otherShip.empire && !this.isAtWar(wars, ship.empire, otherShip.empire)) {
        continue;
      }

      const shipVariables = fleetVariables[ship.fleet.toString()];
      const attack = shipVariables[`ships.${ship.type}.attack.${otherShip.type}` as Variable] ?? shipVariables[`ships.${ship.type}.attack.default` as Variable] ?? 0;
      const otherShipVariables = fleetVariables[otherShip.fleet.toString()];
      const defense = otherShipVariables[`ships.${otherShip.type}.defense.${ship.type}` as Variable] || otherShipVariables[`ships.${otherShip.type}.defense.default` as Variable] || 1;

      // The damage is calculated using A.attack[B.type] / B.defense[A.type] + log(A.experience)
      const effectiveDamage = Math.max(attack / defense + Math.log1p(ship.experience), 0);
      if (effectiveDamage > bestDamage) {
        bestDamage = effectiveDamage;
        bestShip = otherShip;
      }
    }
    return {bestShip, bestDamage};
  }

  private isAtWar(wars: War[], empire1: Types.ObjectId, empire2: Types.ObjectId): boolean {
    if (empire1.equals(empire2)) {
      // fast path
      return false;
    }
    return wars.some(war =>
      war.attacker.equals(empire1) && war.defender.equals(empire2)
      || war.attacker.equals(empire2) && war.defender.equals(empire1)
    );
  }

  private async healFleets(empires: EmpireDocument[], systems: SystemDocument[], fleets: FleetDocument[], ships: ShipDocument[]) {
    // TODO
  }
}
