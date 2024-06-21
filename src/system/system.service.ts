import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {System, SystemDocument} from './system.schema';
import {Game} from '../game/game.schema';
import {UpdateSystemDto} from './system.dto';
import {DistrictName} from '../game-logic/districts';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';
import {calculateVariables, getVariables} from '../game-logic/variables';
import {EmpireService} from '../empire/empire.service';
import {EmpireDocument} from '../empire/empire.schema';
import {ResourceName} from '../game-logic/resources';
import {SystemGeneratorService} from './systemgenerator.service';
import {MemberService} from '../member/member.service';

function getCosts(category: 'districts' | 'buildings', district: DistrictName | BuildingName, districtVariables: any): Record<ResourceName, number> {
  const districtCostKeys = Object.keys(districtVariables).filter(key =>
    key.startsWith(`${category}.${district}.cost.`)
  );

  return Object.fromEntries(districtCostKeys.map(key =>
    [key.split('.').pop() as ResourceName, districtVariables[key]])
  ) as Record<ResourceName, number>;
}

@Injectable()
@EventRepository()
export class SystemService extends MongooseRepository<System> {
  constructor(
    @InjectModel(System.name) model: Model<System>,
    private eventEmitter: EventService,
    private memberService: MemberService,
    private systemGenerator: SystemGeneratorService,
    private empireService: EmpireService,
  ) {
    super(model);
  }

  async updateSystem(system: SystemDocument, dto: UpdateSystemDto, empire: EmpireDocument): Promise<SystemDocument | null> {
    const {districts, buildings, ...rest} = dto;
    system.set(rest);
    if (districts) {
      this.destroyDistricts(system, districts, empire);
    }
    if (buildings) {
      this.updateBuildings(system, buildings, empire);
    }
    await this.empireService.saveAll([empire]);
    await this.saveAll([system]) // emits update events
    return system;
  }

  destroyDistricts(system: SystemDocument, districts: Partial<Record<DistrictName, number>>, empire: EmpireDocument) {
    for (const [district, amount] of Object.entries(districts) as [DistrictName, number][]) {
      if (amount === 0) {
        continue;
      }
      if (amount > 0) {
        throw new BadRequestException('Cannot add districts with this endpoint. Use a Job instead.');
      }
      const oldAmount = system.districts[district] ?? 0;
      if (oldAmount < -amount) {
        throw new ConflictException(`Not enough districts of ${district} to destroy`);
      }

      const districtCost: Record<ResourceName, number> = this.getDistrictCosts(district, empire);
      for (const [resource, cost] of Object.entries(districtCost)) {
        // Refund half of the cost
        empire.resources[resource as ResourceName] += cost * -amount / 2;
        empire.markModified('resources');
      }

      // Destroy the district (amount is negative)
      system.districts[district] = oldAmount + amount;
      system.markModified('districts');
    }
  }

  updateBuildings(system: SystemDocument, buildings: BuildingName[], empire: EmpireDocument) {
    const oldBuildings = this.buildingsOccurrences(system.buildings);
    const newBuildings = this.buildingsOccurrences(buildings);

    // Find out which buildings to remove and add
    const removeBuildings: Partial<Record<BuildingName, number>> = {};

    for (const [building, amount] of Object.entries(oldBuildings)) {
      const bName = building as BuildingName;

      if (newBuildings[bName] < amount) {
        removeBuildings[bName] = amount - newBuildings[bName];
      } else if (newBuildings[bName] > amount) {
        throw new BadRequestException('Cannot add buildings with this endpoint. Use a Job instead.')
      }
    }

    const costs: Record<BuildingName, [ResourceName, number][]> = this.getBuildingCosts(system, buildings, empire);

    this.removeBuildings(system, removeBuildings, costs, empire);

    system.buildings = buildings;
  }

  public getBuildingCosts(system: SystemDocument, buildings: BuildingName[], empire: EmpireDocument): Record<BuildingName, [ResourceName, number][]> {
    const buildingVariables = getVariables('buildings');
    calculateVariables(buildingVariables, empire);
    const costs: Record<BuildingName, [ResourceName, number][]> = {} as Record<BuildingName, [ResourceName, number][]>;
    for (const building of new Set([...buildings, ...system.buildings])) {
      costs[building as BuildingName] = Object.entries(getCosts('buildings', building, buildingVariables)) as [ResourceName, number][];
    }
    return costs;
  }

  public getDistrictCosts(districtName: DistrictName, empire: EmpireDocument): Record<ResourceName, number> {
    const districtVariables = getVariables('districts');
    calculateVariables(districtVariables, empire);
    return getCosts('districts', districtName, districtVariables);
  }

  private buildingsOccurrences(buildings: BuildingName[]): Record<BuildingName, number> {
    const occurrences: Record<BuildingName, number> =
      Object.fromEntries(BUILDING_NAMES.map(building => [building as BuildingName, 0])) as Record<BuildingName, number>;

    for (const building of buildings) {
      occurrences[building]++;
    }

    return occurrences;
  }

  private removeBuildings(system: SystemDocument, removeBuildings: Partial<Record<BuildingName, number>>, costs: Record<BuildingName, [ResourceName, number][]>, empire: EmpireDocument) {
    //Remove buildings and refund half of the cost
    for (const [building, amount] of Object.entries(removeBuildings)) {
      const bName = building as BuildingName;
      const cost: [ResourceName, number][] = costs[bName];

      for (let i = 0; i < amount; i++) {
        system.buildings.splice(system.buildings.indexOf(bName), 1);

        for (const [resource, resourceCost] of cost) {
          empire.resources[resource as ResourceName] += resourceCost / 2;
        }

        empire.markModified('resources');
      }
    }
  }

  async generateMap(game: Game): Promise<SystemDocument[]> {
    return this.createMany(this.systemGenerator.generateMap(game));
  }

  private async emit(event: string, system: System) {
    const members = await this.memberService.findAll({game: system.game}, {projection: {user: 1}});
    // TODO mask population, districts and buildings
    this.eventEmitter.emit(`games.${system.game}.systems.${system._id}.${event}`, system, members.map(m => m.user.toString()));
  }
}
