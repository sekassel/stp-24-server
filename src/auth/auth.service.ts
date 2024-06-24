import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {WsException} from '@nestjs/websockets';
import {IncomingMessage} from 'http';
import {User} from '../user/user.schema';
import {JwtStrategy} from './jwt.strategy';

@Injectable()
export class AuthService {
  // Hack because it is just not possible to inject AuthService into EventModuleOptions
  static instance: AuthService;

  constructor(
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {
    AuthService.instance = this;
  }

  async parseUserForWebSocket(message: IncomingMessage): Promise<User | undefined> {
    const token = this.getToken(message);
    if (!token) {
      throw new WsException('Not authorized');
    }

    try {
      const parsedToken = this.jwtService.verify(token);
      return await this.jwtStrategy.validate(parsedToken);
    } catch (error: any) {
      throw new WsException(error);
    }
  }

  getToken(message: IncomingMessage): string | undefined {
    const authHeader = message.headers.authorization;
    if (authHeader) {
      const headerToken = authHeader.startsWith('Bearer ') ? authHeader.substring('Bearer '.length) : undefined;
      if (headerToken) {
        return headerToken;
      }
    }
    const url = new URL(`http://localhost${message.url}`);
    const queryToken = url.searchParams.get('authToken');
    return queryToken ?? undefined;
  }
}
