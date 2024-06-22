import {BadRequestException, Injectable} from '@nestjs/common';
import {EmpireDocument} from '../empire/empire.schema';
import {ResourceName} from '../game-logic/resources';
import {CreateJobDto} from './job.dto';
import {UserDocument} from '../user/user.schema';
import {SystemDocument} from '../system/system.schema';
import {JobType} from './job-type.enum';
import {notFound} from '@mean-stream/nestx';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {JobDocument} from './job.schema';
import {EmpireLogicService} from '../empire/empire-logic.service';
import {SystemLogicService} from '../system/system-logic.service';

@Injectable()
export class JobLogicService {
  constructor(
    private readonly empireLogicService: EmpireLogicService,
    private readonly systemLogicService: SystemLogicService,
  ) {
  }

  getCost(dto: CreateJobDto, user: UserDocument, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {

    switch (dto.type as JobType) {
      case JobType.BUILDING:
        if (!system) notFound(dto.system);
        const building = dto.building;
        if (!building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        return this.empireLogicService.getCosts('buildings', building, empire, system);

      case JobType.DISTRICT:
        const district = dto.district;
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        return this.empireLogicService.getCosts('districts', district, empire, system);

      case JobType.UPGRADE:
        if (!system) notFound(dto.system);
        if (system.owner !== empire._id && system.upgrade !== 'unexplored' && system.upgrade !== 'explored') {
          throw new BadRequestException('You can only upgrade systems you own.');
        }
        const type = SYSTEM_UPGRADES[system.upgrade]?.next;
        if (!type) {
          throw new BadRequestException('System type cannot be upgraded further.');
        }
        return this.empireLogicService.getCosts('systems', type, empire, system);

      case JobType.TECHNOLOGY:
        if (!dto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[dto.technology] ?? notFound(dto.technology);
        return {research: this.empireLogicService.getTechnologyCost(user, empire, technology)};
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
