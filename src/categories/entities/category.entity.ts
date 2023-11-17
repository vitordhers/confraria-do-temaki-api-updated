import { ICategory } from '../../shared/interfaces/category.interface';

export class DbCategory implements ICategory {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public rank?: number,
    public description?: string,
  ) {}
}
