import {Injectable} from '@nestjs/common';
import {GroupService} from '../group/group.service';
import {Types} from "mongoose";

export enum Namespace {
  groups = 'groups',
  global = 'global',
}

export type UserFilter = string[] | 'global';

@Injectable()
export class MemberResolverService {
  constructor(
    private groupService: GroupService,
  ) {
  }

  async resolve(namespace: Namespace, id: Types.ObjectId): Promise<UserFilter> {
    switch (namespace) {
      case Namespace.groups:
        const group = await this.groupService.find(id);
        return group?.members ?? [];
      case Namespace.global:
        return 'global';
      default:
        return [];
    }
  }
}
