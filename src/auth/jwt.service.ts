import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Algorithms } from './enums/algorithms.enum';
import { Credentials } from './interfaces/credentials.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async getCredentials(
    payload: IJwtPayload,
    returnRefreshToken = false,
  ): Promise<Credentials> {
    const credentials: Credentials = {
      accessToken: this.createAccessToken(payload),
    };
    if (returnRefreshToken) {
      credentials.refreshToken = this.createRefreshToken(payload);
    }
    return credentials;
  }

  createAccessToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_PRIVATE'),
      expiresIn: '10m',
      algorithm: Algorithms.ES384,
    });
  }

  createRefreshToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_PRIVATE'),
      expiresIn: '30d',
      algorithm: Algorithms.ES512,
    });
  }

  decodeToken(token: string, publicKey: string) {
    return this.jwtService.verify(token, { publicKey });
  }
}
