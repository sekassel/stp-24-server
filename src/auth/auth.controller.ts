import {Controller, HttpCode, HttpStatus, UnauthorizedException} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from './auth.decorator';
import {Throttled} from '../util/throttled.decorator';
import {LoginDto, LoginResult, RefreshDto} from '../user/user.dto';
import {User} from '../user/user.schema';
import {UserService} from '../user/user.service';
import {TypedBody, TypedException, TypedRoute} from '@nestia/core';
import {ErrorResponse} from '../util/error-response';

@Controller('auth')
@ApiTags('Authentication')
@Throttled()
export class AuthController {
  constructor(
    private userService: UserService,
  ) {
  }

  /**
   * Log in with user credentials.
   * @param dto username and password
   */
  @TypedRoute.Post('login')
  @TypedException<ErrorResponse>(HttpStatus.UNAUTHORIZED, 'Invalid username or password')
  async login(
    @TypedBody() dto: LoginDto,
  ): Promise<LoginResult> {
    const token = await this.userService.login(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return token;
  }

  /**
   * Log in with a refresh token.
   * @param dto refresh token
   */
  @TypedRoute.Post('refresh')
  @TypedException<ErrorResponse>(HttpStatus.UNAUTHORIZED, 'Invalid or expired refresh token')
  async refresh(@TypedBody() dto: RefreshDto): Promise<LoginResult> {
    const token = await this.userService.refresh(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    return token;
  }

  /**
   * Log out the current user **everywhere** by invalidating the refresh token.
   * @param user
   */
  @TypedRoute.Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  async logout(@AuthUser() user: User): Promise<void> {
    await this.userService.logout(user);
  }
}
