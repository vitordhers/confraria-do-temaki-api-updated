import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  Min,
  Max,
  IsNumber,
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
  @IsNumber()
  @Min(1)
  @Max(9998)
  rank?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 200)
  description: string;
}
