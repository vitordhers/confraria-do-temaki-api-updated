import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DbCategory } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FirestoreService } from '../db/firestore.service';
import { Collection } from '../db/collection.enum';
import { inspect } from 'util';

@Injectable()
export class CategoriesService {
  private logger = new Logger('CategoriesService');
  constructor(private firestoreService: FirestoreService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, slug, rank, description } = createCategoryDto;
    try {
      const newCategory: DbCategory = {
        id: uuid(),
        name,
        slug,
        rank,
        description,
      };
      const result = await this.firestoreService.create(
        Collection.CATEGORIES,
        newCategory,
      );
      if (!result || !result.success) {
        throw new BadRequestException(`create non-successful ${result}`);
      }
      return newCategory;
    } catch (error) {
      this.logger.error(`create error: ${inspect({ error }, { depth: null })}`);
    }
  }

  // async createBulk(createCategoryDtos: CreateCategoryDto[]) {
  //   const newCategories = createCategoryDtos.map((dto) => ({
  //     id: uuid(),
  //     name: dto.name,
  //     slug: dto.slug,
  //     description: dto.description,
  //   }));

  //   const result = await this.dbService.query(
  //     Map(
  //       newCategories,
  //       Lambda(
  //         ['data'],
  //         Create(Collection('categories'), { data: Var('data') }),
  //       ),
  //     ),
  //   );
  //   return result;
  // }

  async findAll(): Promise<DbCategory[]> {
    try {
      const result = await this.firestoreService.get(Collection.CATEGORIES);
      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `findAll failed ${inspect({ result }, { depth: null })}`,
        );
      }
      const parsedResult = this.firestoreService.parseFirebaseResult(
        Collection.CATEGORIES,
        result,
      ) as DbCategory[] | DbCategory;
      if (Array.isArray(parsedResult)) {
        return [...parsedResult];
      }
      return [parsedResult];
    } catch (error) {
      this.logger.error(`create error: ${inspect({ error }, { depth: null })}`);
      return [];
    }
  }

  async update(updateCategoryDto: UpdateCategoryDto) {
    const { id } = updateCategoryDto;
    try {
      return (await this.firestoreService.update(
        Collection.CATEGORIES,
        id,
        updateCategoryDto,
      )) as DbCategory;
    } catch (error) {
      this.logger.error(`update error: ${inspect({ error }, { depth: null })}`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.firestoreService.delete(
        Collection.CATEGORIES,
        id,
      );
      if (!result) {
        throw new BadRequestException(
          `Category with id ${id} couldn't be deleted`,
        );
      }
    } catch (error) {
      this.logger.error(`remove error: ${inspect({ error }, { depth: null })}`);
    }
  }
}
