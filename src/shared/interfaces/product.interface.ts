import { IIngredient } from './ingredient.interface';
import { IPrice } from './price.interface';

export interface IProduct {
  id?: string;
  name: string;
  categoriesIds: string[];
  unitsAvailable: string[];
  price: IPrice[];
  slug: string;
  imageUrl?: string;
  description?: string;
  attributes?: any[];
  requested?: boolean;
  conditions?: string[];
  notes?: string[];
  ingredients?: IIngredient[];
  rank?: number;
}
