import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateCategoryDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  slug: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 200)
  description: string;
}
