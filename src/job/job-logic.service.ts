import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {EmpireDocument} from '../empire/empire.schema';
import {ResourceName} from '../game-logic/resources';
import {CreateJobDto} from './job.dto';
import {SystemDocument} from '../system/system.schema';
import {JobType} from './job-type.enum';
import {notFound} from '@mean-stream/nestx';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {JobDocument} from './job.schema';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {SystemLogicService} from '../system/system-logic.service';
import {calculateVariables, flatten} from '../game-logic/variables';
import {BUILDINGS} from '../game-logic/buildings';
import {Variable} from '../game-logic/types';
import {DISTRICTS} from '../game-logic/districts';
import {SHIP_TYPES, ShipTypeName} from '../game-logic/ships';
import {FleetDocument} from '../fleet/fleet.schema';
import {ShipDocument} from '../ship/ship.schema';
import {ShipService} from '../ship/ship.service';
import {FleetService} from '../fleet/fleet.service';

@Injectable()
export class JobLogicService {
  constructor(
    private readonly empireLogicService: EmpireLogicService,
    private readonly systemLogicService: SystemLogicService,
    private readonly fleetService: FleetService,
    private readonly shipService: ShipService,
  ) {
  }

  getCostAndDuration(dto: CreateJobDto, empire: EmpireDocument, system?: SystemDocument, systemPaths?: SystemDocument[], fleet?: FleetDocument, ships?: ShipDocument[]): Partial<Record<ResourceName | 'time', number>> {
    switch (dto.type as JobType) {
      case JobType.BUILDING: {
        if (!system) notFound(dto.system);
        if (!empire._id.equals(system.owner)) {
          throw new ForbiddenException('You can only build buildings in your own systems.');
        }
        const building = dto.building;
        if (!building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        const variables: Partial<Record<Variable, number>> = {
          ...flatten(BUILDINGS[building].cost, `buildings.${building}.cost.`),
          [`buildings.${building}.build_time`]: BUILDINGS[building].build_time,
        };
        calculateVariables(variables, empire, system);
        return {
          ...this.empireLogicService.getCosts(`buildings.${building}.cost`, variables),
          time: variables[`buildings.${building}.build_time`],
        };
      }
      case JobType.DISTRICT: {
        if (!system) notFound(dto.system);
        if (!empire._id.equals(system.owner)) {
          throw new ForbiddenException('You can only build districts in your own systems.');
        }
        const district = dto.district;
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        const variables: Partial<Record<Variable, number>> = {
          ...flatten(DISTRICTS[district].cost, `districts.${district}.cost.`),
          [`districts.${district}.build_time`]: DISTRICTS[district].build_time,
        };
        calculateVariables(variables, empire, system);
        return {
          ...this.empireLogicService.getCosts(`districts.${district}.cost`, variables),
          time: variables[`districts.${district}.build_time`],
        };
      }
      case JobType.UPGRADE: {
        if (!system) notFound(dto.system);
        if (!empire._id.equals(system.owner) && system.upgrade !== 'unexplored' && system.upgrade !== 'explored') {
          throw new ForbiddenException('You can only upgrade systems you own.');
        }
        const nextUpgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
        if (!nextUpgrade) {
          throw new ConflictException('System cannot be upgraded further.');
        }
        const variables: Partial<Record<Variable, number>> = {
          ...flatten(SYSTEM_UPGRADES[nextUpgrade].cost, `systems.${nextUpgrade}.cost.`),
          [`systems.${nextUpgrade}.upgrade_time`]: SYSTEM_UPGRADES[nextUpgrade].upgrade_time,
        };
        calculateVariables(variables, empire, system);

        const totalCosts = {...this.empireLogicService.getCosts(`systems.${nextUpgrade}.cost`, variables)};
        if (system.upgrade === 'explored') {
          const colonizerShipCost = this.empireLogicService.getShipCost(empire, SHIP_TYPES.colonizer);
          for (const [resource, cost] of Object.entries(colonizerShipCost)) {
            const r = resource as ResourceName;
            if (totalCosts[r]) {
              totalCosts[r] += cost;
            } else {
              totalCosts[r] = cost;
            }
          }
        }

        return {
          ...totalCosts,
          time: variables[`systems.${nextUpgrade}.upgrade_time`],
        };
      }
      case JobType.TECHNOLOGY: {
        if (!dto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[dto.technology] ?? notFound(dto.technology);
        return {
          research: this.empireLogicService.getTechnologyCost(empire, technology),
          time: this.empireLogicService.getTechnologyTime(empire, technology),
        };
      }
      case JobType.SHIP: {
        if (!dto.ship || !dto.fleet) {
          throw new BadRequestException('Ship type and fleet id are required for this job type.');
        }
        if (!system) notFound(dto.system);
        if (!empire._id.equals(system.owner)) {
          throw new ForbiddenException('You can only build ships in your own systems.');
        }
        if (!system.buildings.includes('shipyard')) {
          throw new ConflictException('You must have a shipyard in the system to build ships.');
        }
        const ship = SHIP_TYPES[dto.ship as ShipTypeName] ?? notFound(dto.ship as ShipTypeName);
        const time = this.empireLogicService.getShipTime(empire, ship);
        if (!time) {
          throw new ConflictException('This ship type is not unlocked yet (build_time=0).');
        }
        return {
          ...this.empireLogicService.getShipCost(empire, ship),
          time,
        };
      }
      case JobType.TRAVEL: {
        if (!systemPaths || !fleet) {
          throw new BadRequestException('Path and fleet id are required for this job type.');
        }
        if (!ships || ships.length === 0) {
          throw new ConflictException('There are no ships available to travel in this fleet.');
        }
        if (!systemPaths[0]._id.equals(fleet.location)) {
          throw new ConflictException('Path must start with the fleet\'s current location.');
        }
        return {
          time: this.systemLogicService.getTravelTime(systemPaths, fleet, ships, empire)
        };
      }
      default:
        throw new BadRequestException('Invalid job type.');
    }
  }

  refundResources(empire: EmpireDocument, job: JobDocument) {
    job.cost && this.empireLogicService.refundResources(empire, job.cost);
  }

  async completeJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
    switch (job.type as JobType) {
      case JobType.TECHNOLOGY:
        if (!job.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        this.empireLogicService.unlockTechnology(job.technology, empire);
        break;

      case JobType.BUILDING:
        if (!job.building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        this.systemLogicService.buildBuilding(system ?? notFound(job.system), job.building);
        break;

      case JobType.DISTRICT:
        if (!job.district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        this.systemLogicService.buildDistrict(system ?? notFound(job.system), job.district);
        break;

      case JobType.UPGRADE:
        this.systemLogicService.upgradeSystem(system ?? notFound(job.system), empire);
        break;

      case JobType.SHIP:
        if (!job.fleet || !job.ship) {
          throw new BadRequestException('Fleet and ship type are required for this job type.');
        }
        await this.shipService.buildShip(system ?? notFound(job.system), job);

      case JobType.TRAVEL:
        if (!job.fleet || !job.path) {
          throw new BadRequestException('Fleet and path are required for this job type.');
        }
        // Ensure the fleet actually arrives at the destination, even if some rounding errors occur
        await this.fleetService.update(job.fleet, {location: job.path[job.path.length - 1]});
        break;
    }
  }

  checkFleet(shipType: ShipTypeName, fleets: FleetDocument[], ships: ShipDocument[]): ShipDocument {
    if (!fleets || fleets.length === 0) {
      this.throwForbiddenException(shipType);
    }
    return this.checkShip(ships, shipType);
  }

  private checkShip(ships: ShipDocument[], shipType: ShipTypeName): ShipDocument {
    if (!ships || ships.length === 0) {
      this.throwForbiddenException(shipType);
    }
    const ship = ships.find(ship => ship.type === shipType);
    if (ship) {
      return ship;
    }
    this.throwForbiddenException(shipType);
  }

  throwForbiddenException(shipType: ShipTypeName): never {
    throw new ForbiddenException(`You must have a fleet with ship '${shipType}' in the system to upgrade it.`);
  }
}
