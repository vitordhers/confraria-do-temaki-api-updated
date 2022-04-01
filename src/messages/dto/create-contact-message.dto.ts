import { IsDefined, IsEmail, IsString, Length } from 'class-validator';
import { GoogleRecaptchaV3 } from '../../shared/validators/google-recaptcha-v3.constraint';

export default class CreateContactMessageDto {
  @IsDefined({ message: 'O nome não pode ser um campo vazio.' })
  @IsString({ message: 'O nome deve ser do tipo String.' })
  @Length(5, 100, { message: 'O nome deve conter entre 5 e 100 caracteres.' })
  name: string;

  @IsDefined({ message: 'O e-mail não pode ser um campo vazio.' })
  @IsString({ message: 'O e-mail deve ser do tipo String.' })
  @IsEmail(undefined, { message: 'O e-mail é inválido.' })
  @Length(6, 50, { message: 'O nome deve conter entre 6 e 50 caracteres.' })
  email: string;
  @IsDefined()
  @IsString()
  @Length(10, 1000, {
    message: 'A mensagem deve ter pelo menos 10 e até 1000 caracteres.',
  })
  message: string;

  @IsDefined()
  @IsString()
  @GoogleRecaptchaV3({
    message: 'Atividade considerada suspeita pelo Google Recaptcha!',
  })
  recaptcha: string;
}
