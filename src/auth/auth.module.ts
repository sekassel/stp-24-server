import {forwardRef, Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {environment} from '../environment';
import {AuthService} from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {AuthController} from './auth.controller';
import {UserModule} from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: environment.auth.secret,
      verifyOptions: {
      },
      signOptions: {
        expiresIn: environment.auth.expiry,
      },
    }),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {
}
