import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  NotEquals,
  Length,
} from 'class-validator';

export class CreateUnitDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  location: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(6, 200)
  address: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(14, 14, {
    message: 'O celular deve conter 14 dígitos com pelo menos 10 números.',
  })
  telephone: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  workingHours: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @NotEquals(0)
  lat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @NotEquals(0)
  lng: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(16, 16, {
    message: 'O celular deve conter 15 dígitos com pelo menos 11 números.',
  })
  whatsapp?: string;
}
