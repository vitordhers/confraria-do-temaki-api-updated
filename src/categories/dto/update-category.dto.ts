import { PartialType } from '@nestjs/mapped-types';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;
}
