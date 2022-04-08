import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Collection,
  Create,
  Get,
  Ref,
  Map,
  Paginate,
  Match,
  Index,
  Lambda,
  Documents,
  Var,
  Delete,
  Select,
} from 'faunadb';
import { FaunaDbService } from '../db/faunadb.service';
import { v4 as uuid } from 'uuid';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DbCategory } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private dbService: FaunaDbService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, slug, description } = createCategoryDto;
    const newCategory: DbCategory = {
      id: uuid(),
      name,
      slug,
      description,
    };
    return await this.dbService.query<DbCategory>(
      Create(Collection('categories'), {
        data: newCategory,
      }),
    );
  }

  async createBulk(createCategoryDtos: CreateCategoryDto[]) {
    const newCategories = createCategoryDtos.map((dto) => ({
      id: uuid(),
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
    }));

    const result = await this.dbService.query(
      Map(
        newCategories,
        Lambda(
          ['data'],
          Create(Collection('categories'), { data: Var('data') }),
        ),
      ),
    );
    return result;
  }

  async findAll() {
    const result = (await this.dbService.query<DbCategory>(
      Map(
        Paginate(Documents(Collection('categories'))),
        Lambda((x) => Get(x)),
      ),
    )) as DbCategory[];
    if (result) {
      return result;
    }
    return [];
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} unit`;
  }

  async remove(id: string) {
    const result = (await this.dbService.query<DbCategory>(
      Delete(Select(['ref'], Get(Match(Index('category_by_id'), id)))),
    )) as DbCategory;
    if (!result) {
      throw new BadRequestException(
        `Category with id ${id} couldn't be deleted`,
      );
    }
    return;
  }
}
