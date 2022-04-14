import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcryptjs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { TokenService } from './jwt.service';
// import { v4 as uuid } from 'uuid';
import { SignInDto } from './dto/signin.dto';
import { IUser } from 'src/shared/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private httpService: HttpService,
    private tokenService: TokenService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new BadRequestException();
    }

    const { id, role, unitsOwnedIds } = user;
    const jwtPayload = { id, role, unitsOwnedIds };
    return await this.tokenService.getCredentials(jwtPayload, true);
  }
  async validateUser(
    email: string,
    password: string,
  ): Promise<IUser | undefined> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException();
    }
    const [salt, dbpassword] = user.password.split(':');
    const hashedPassword = await hash(password, salt);
    if (dbpassword !== hashedPassword) {
      throw new UnauthorizedException();
    }
    delete user.password;
    return user;
  }

  async googleRecaptchaCheck(
    response: string,
    remoteip?: string,
  ): Promise<boolean> {
    const secret_key = this.configService.get<string>(
      'GOOGLE_RECAPTCHA_SECRET',
    );
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response}`;
    const $src = await this.httpService
      .post(url)
      .pipe(map((r) => (r.data.score > 0.7 ? true : false)));
    const result = firstValueFrom($src);
    return result;
  }
}
