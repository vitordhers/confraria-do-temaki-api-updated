import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { GoogleRecaptchaV3 } from 'src/shared/validators/google-recaptcha-v3.constraint';

export class UpdateUserPasswordDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @GoogleRecaptchaV3({
    message: 'Atividade considerada suspeita pelo Google Recaptcha!',
  })
  recaptcha: string;
}
