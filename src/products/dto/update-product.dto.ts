import { PartialType } from '@nestjs/mapped-types';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;
}
