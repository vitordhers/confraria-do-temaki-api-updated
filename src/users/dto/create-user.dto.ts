import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { GoogleRecaptchaV3 } from 'src/shared/validators/google-recaptcha-v3.constraint';
import { UserRole } from '../../shared/enums/user-role.enum';

export class CreateUserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString({ each: true })
  unitsOwnedIds: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsDefined()
  @IsString()
  @GoogleRecaptchaV3({
    message: 'Atividade considerada suspeita pelo Google Recaptcha!',
  })
  recaptcha: string;
}
