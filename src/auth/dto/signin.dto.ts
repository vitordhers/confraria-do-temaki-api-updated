import { IsDefined, IsEmail, IsNotEmpty, Length } from 'class-validator';
import { GoogleRecaptchaV3 } from '../../shared/validators/google-recaptcha-v3.constraint';

export class SignInDto {
  @IsDefined()
  @IsNotEmpty()
  @Length(6, 50)
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @GoogleRecaptchaV3()
  recaptcha: string;
}
