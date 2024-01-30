import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Observable} from 'rxjs';
import {User} from '../user/user.schema';
import {MemberService} from './member.service';
import {Types} from 'mongoose';

@Injectable()
export class MemberAuthGuard implements CanActivate {
  constructor(
    private memberService: MemberService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const id = new Types.ObjectId(req.params.game);
    const user = (req as any).user;
    return this.checkAuth(id, user);
  }

  async checkAuth(game: Types.ObjectId, user: User): Promise<boolean> {
    return !!await this.memberService.findOne({game, user: user._id});
  }
}
