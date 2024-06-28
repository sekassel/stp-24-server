import {BadRequestException, Injectable} from '@nestjs/common';
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

@Injectable()
export class JobLogicService {
  constructor(
    private readonly empireLogicService: EmpireLogicService,
    private readonly systemLogicService: SystemLogicService,
  ) {
  }

  getCostAndDuration(dto: CreateJobDto, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName | 'time', number>> {
    switch (dto.type as JobType) {
      case JobType.BUILDING: {
        if (!system) notFound(dto.system);
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
          throw new BadRequestException('You can only upgrade systems you own.');
        }
        const nextUpgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
        if (!nextUpgrade) {
          throw new BadRequestException('System cannot be upgraded further.');
        }
        const variables: Partial<Record<Variable, number>> = {
          ...flatten(SYSTEM_UPGRADES[nextUpgrade].cost, `systems.${nextUpgrade}.cost.`),
          [`systems.${nextUpgrade}.upgrade_time`]: SYSTEM_UPGRADES[nextUpgrade].upgrade_time,
        };
        calculateVariables(variables, empire, system);
        return {
          ...this.empireLogicService.getCosts(`systems.${nextUpgrade}.cost`, variables),
          time: variables[`systems.${nextUpgrade}.upgrade_time`],
        };
      }

      case JobType.TECHNOLOGY:
        if (!dto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[dto.technology] ?? notFound(dto.technology);
        return {
          research: this.empireLogicService.getTechnologyCost(empire, technology),
          time: this.empireLogicService.getTechnologyTime(empire, technology),
        };
    }
  }

  refundResources(empire: EmpireDocument, job: JobDocument) {
    job.cost && this.empireLogicService.refundResources(empire, job.cost);
  }

  completeJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
    switch (job.type as JobType) {
      case JobType.TECHNOLOGY:
        if (!job.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        return this.empireLogicService.unlockTechnology(job.technology, empire);

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
        return;

      case JobType.UPGRADE:
        return this.systemLogicService.upgradeSystem(system ?? notFound(job.system), empire);
    }
  }
}
