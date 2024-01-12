import {Controller, HttpCode, HttpStatus, UnauthorizedException} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {Auth, AuthUser} from './auth.decorator';
import {Throttled} from '../util/throttled.decorator';
import {LoginDto, LoginResult, RefreshDto} from '../user/user.dto';
import {User} from '../user/user.schema';
import {UserService} from '../user/user.service';
import {TypedBody, TypedRoute} from '@nestia/core';

@Controller('auth')
@ApiTags('Authentication')
@Throttled()
export class AuthController {
  constructor(
    private userService: UserService,
  ) {
  }

  @TypedRoute.Post('login')
  @ApiOperation({ description: 'Log in with user credentials.' })
  @ApiCreatedResponse({ type: LoginResult })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@TypedBody() dto: LoginDto): Promise<LoginResult> {
    const token = await this.userService.login(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return token;
  }

  @TypedRoute.Post('refresh')
  @ApiOperation({ description: 'Log in with a refresh token.' })
  @ApiCreatedResponse({ type: LoginResult })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@TypedBody() dto: RefreshDto): Promise<LoginResult> {
    const token = await this.userService.refresh(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    return token;
  }

  @TypedRoute.Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ description: 'Logs out the current user by invalidating the refresh token.' })
  @ApiNoContentResponse()
  async logout(@AuthUser() user: User): Promise<void> {
    await this.userService.logout(user);
  }
}
