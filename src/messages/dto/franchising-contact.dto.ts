import { Length, IsEmail, IsDefined, IsString, IsEnum } from 'class-validator';
import { InvestmentRange } from '../../shared/enums/investment-range.enum';
import { GoogleRecaptchaV3 } from '../../shared/validators/google-recaptcha-v3.constraint';

export default class FranchisingContactDto {
  @IsDefined({ message: 'O nome não pode ser um campo vazio.' })
  @IsString({ message: 'O nome deve ser do tipo String.' })
  @Length(5, 100, { message: 'O nome deve conter entre 5 e 100 caracteres.' })
  name: string;

  @IsDefined({ message: 'O e-mail não pode ser um campo vazio.' })
  @IsString({ message: 'O e-mail deve ser do tipo String.' })
  @IsEmail(undefined, { message: 'O e-mail é inválido.' })
  @Length(6, 50, { message: 'O nome deve conter entre 6 e 50 caracteres.' })
  email: string;

  @IsDefined({ message: 'O celular não pode ser um campo vazio.' })
  @IsString({ message: 'O celular deve ser do tipo String.' })
  @Length(16, 16, {
    message: 'O celular deve conter 15 dígitos com pelo menos 11 números.',
  })
  celphone: string;

  @IsDefined({ message: 'O telefone não pode ser um campo vazio.' })
  @IsString({ message: 'O telefone deve ser do tipo String.' })
  @Length(14, 14, {
    message: 'O celular deve conter 14 dígitos com pelo menos 10 números.',
  })
  telephone: string;

  @IsDefined({ message: 'A cidade não pode ser um campo vazio.' })
  @IsString({ message: 'A cidade deve ser do tipo String.' })
  @Length(2, 50, { message: 'A cidade deve conter entre 2 e 50 caracteres.' })
  city: string;

  @IsDefined({ message: 'A sigla do Estado não pode ser um campo vazio.' })
  @IsString({ message: 'A sigla do Estado deve ser do tipo String.' })
  @Length(2, 2, { message: 'A sigla do Estado deve conter 2 caracteres.' })
  state: string;

  @IsDefined({
    message: 'O valor do Investimento pretendido é Obrigatório.',
  })
  @IsEnum(InvestmentRange)
  investment: InvestmentRange;

  @IsDefined()
  @IsString()
  @Length(3, 100, {
    message:
      'A descrição de como nos conheceu deve ter pelo menos 3 e até 100 caracteres.',
  })
  reference: string;

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
