import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../shared/enums/user-role.enum';
import mapPayloadToResponse from '../shared/functions/map-payload-to-response.function';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import { AuthService } from './auth.service';
import { GetDataFromRefreshToken } from './decorators/get-data-from-refresh-token.decorator';
import { SignInDto } from './dto/signin.dto';
import { RefreshToken } from './guards/refresh-token.guard';
import { Credentials } from './interfaces/credentials.interface';
import { TokenService } from './jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Get('token')
  @UseGuards(RefreshToken)
  async refreshToken(
    @GetDataFromRefreshToken()
    {
      user: { id, role },
      refreshToken,
    }: {
      user: { id: string; role: UserRole };
      refreshToken: string;
    },
  ) {
    const accessToken = await this.tokenService.createAccessToken({ id, role });
    return mapPayloadToResponse<Credentials>(true, {
      accessToken,
      refreshToken,
    });
  }

  @Post('/signin')
  async signIn(@Body() signInDto: SignInDto) {
    return await mapRequestToResponse<Credentials>(
      this.authService,
      this.authService.signIn,
      signInDto,
    );
  }
}
