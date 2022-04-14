import { ICategory } from '../../shared/interfaces/category.interface';

export class DbCategory implements ICategory {
  id: string;
  name: string;
  slug: string;
  rank?: number;
  description?: string;
}
