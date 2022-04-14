import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseArrayPipe,
  Put,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import mapRequestToResponse from '../shared/functions/map-request-to-response.function';
import { DbProduct } from './entities/product.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import fileFilter from './functions/file-filter.function';
import { AdminToken } from 'src/auth/guards/admin-role.guard';
import { Multer } from 'multer'; // this line makes multer types available
import { UpdateUnitsDto } from './dto/update-units.dto';
import { AccessToken } from 'src/auth/guards/jwt.guard';
import { DbUser } from 'aws-sdk/clients/cloudwatchevents';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AdminToken)
  async create(@Body() createProductDto: CreateProductDto) {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.create,
      createProductDto,
    );
  }

  @Post('bulk')
  @UseGuards(AdminToken)
  async createBulk(
    @Body(new ParseArrayPipe({ items: CreateProductDto }))
    createProductDtos: CreateProductDto[],
  ) {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.createBulk,
      createProductDtos,
    );
  }

  @Get()
  async findAll() {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.findAll,
    );
  }

  @Put()
  @UseGuards(AdminToken)
  async update(@Body() updateProductDto: UpdateProductDto) {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.update,
      updateProductDto,
    );
  }

  @Patch('units')
  @UseGuards(AccessToken)
  async updateUnits(
    @Req() { user }: { user: DbUser },
    @Body() updateUnitsDto: UpdateUnitsDto,
  ) {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.updateUnits,
      user,
      updateUnitsDto,
    );
  }

  @Post('upload-image')
  @UseGuards(AdminToken)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        limits: { fieldSize: 25 * 1024 * 1024 },
        fileFilter: fileFilter,
      },
    ),
  )
  async uploadImage(
    @UploadedFiles()
    files: {
      image: Express.Multer.File[];
      thumbnail: Express.Multer.File[];
    },
  ) {
    return await mapRequestToResponse<
      {
        type: string;
        ext: string;
        name: string;
        url: string;
      }[]
    >(this.productsService, this.productsService.uploadFilesToS3, files);
  }

  @Delete(':id')
  @UseGuards(AdminToken)
  async remove(@Param('id') id: string) {
    return await mapRequestToResponse<DbProduct>(
      this.productsService,
      this.productsService.remove,
      id,
    );
  }
}
