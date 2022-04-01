import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  NotEquals,
  ValidateNested,
  Length,
} from 'class-validator';
import { IIngredient } from '../../shared/interfaces/ingredient.interface';
import { IPrice } from '../../shared/interfaces/price.interface';
export class CreateProductDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsString({
    each: true,
  })
  categoriesIds: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsString({
    each: true,
  })
  unitsAvailable: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested()
  price: Price[];

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  slug: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  attributes?: any[];

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  requested?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({
    each: true,
  })
  conditions?: string[];

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({
    each: true,
  })
  notes?: string[];

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  ingredients?: Ingredient[];
}

class Price implements IPrice {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @NotEquals(0)
  price: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  unitId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  size?: string;
}

class Ingredient implements IIngredient {
  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  display: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsString({
    each: true,
  })
  options?: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title: string;
}
