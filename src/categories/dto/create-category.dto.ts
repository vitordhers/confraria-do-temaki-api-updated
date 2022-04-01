import { IsDefined, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;
}
