import { IPrice } from '../../shared/interfaces/price.interface';
import { IIngredient } from '../../shared/interfaces/ingredient.interface';
import { IProduct } from '../../shared/interfaces/product.interface';

export class DbProduct implements IProduct {
  public id: string;
  public name: string;
  public categoriesIds: string[];
  public unitsAvailable: string[];
  public price: IPrice[];
  public slug: string;
  public imageUrl?: string;
  public description?: string;
  public attributes?: any[];
  public requested?: boolean;
  public conditions?: string[];
  public notes?: string[];
  public ingredients?: IIngredient[];
}
