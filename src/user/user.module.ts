import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {AuthModule} from '../auth/auth.module';
import {environment} from '../environment';
import {UserController} from './user.controller';
import {UserScheduler} from './user.scheduler';
import {UserSchema} from './user.schema';
import {UserService} from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'users',
        schema: UserSchema,
      },
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: environment.passive ? [UserService] : [UserService, UserScheduler],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
}
