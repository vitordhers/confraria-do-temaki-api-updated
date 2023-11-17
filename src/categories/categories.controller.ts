import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AdminToken } from '../auth/guards/admin-role.guard';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DbCategory } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AdminToken)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await mapRequestToResponse<DbCategory>(
      this.categoriesService,
      this.categoriesService.create,
      createCategoryDto,
    );
  }

  // @Post('bulk')
  // @UseGuards(AdminToken)
  // async createBulk(
  //   @Body(new ParseArrayPipe({ items: CreateCategoryDto }))
  //   createCategoryDtos: CreateCategoryDto[],
  // ) {
  //   return await mapRequestToResponse<DbCategory>(
  //     this.categoriesService,
  //     this.categoriesService.createBulk,
  //     createCategoryDtos,
  //   );
  // }

  @Get()
  async findAll() {
    return await mapRequestToResponse(
      this.categoriesService,
      this.categoriesService.findAll,
    );
  }

  @Put()
  @UseGuards(AdminToken)
  async update(@Body() updateUnitDto: UpdateCategoryDto) {
    return await mapRequestToResponse<DbCategory>(
      this.categoriesService,
      this.categoriesService.update,
      updateUnitDto,
    );
  }

  @Delete(':id')
  @UseGuards(AdminToken)
  async remove(@Param('id') id: string) {
    return await mapRequestToResponse<void>(
      this.categoriesService,
      this.categoriesService.remove,
      id,
    );
  }
}
