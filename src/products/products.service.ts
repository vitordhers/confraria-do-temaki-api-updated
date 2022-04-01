import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Collection,
  Create,
  Map,
  Lambda,
  Var,
  Paginate,
  Documents,
  Get,
  Update,
  Match,
  Index,
  Select,
  Delete,
} from 'faunadb';
import { FaunaDbService } from '../db/faunadb.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuid } from 'uuid';
import { DbProduct } from './entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { S3, config } from 'aws-sdk';
// const AWS = require('aws-sdk');

@Injectable()
export class ProductsService {
  constructor(
    private dbService: FaunaDbService,
    private configService: ConfigService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      name,
      categoriesIds,
      unitsAvailable,
      price,
      slug,
      imageUrl,
      description,
      attributes,
      requested,
      conditions,
      notes,
      ingredients,
    } = createProductDto;

    const newProduct: DbProduct = {
      id: uuid(),
      name,
      categoriesIds,
      unitsAvailable,
      price,
      slug,
      imageUrl,
      description,
      attributes,
      requested,
      conditions,
      notes,
      ingredients,
    };

    const result = await this.dbService.query<DbProduct>(
      Create(Collection('products'), {
        data: newProduct,
      }),
    );
    return result;
  }

  async createBulk(createProductDto: CreateProductDto[]) {
    const newProducts = createProductDto.map((dto) => ({
      id: uuid(),
      name: dto.name,
      categoriesIds: dto.categoriesIds,
      unitsAvailable: dto.unitsAvailable,
      price: dto.price,
      slug: dto.slug,
      imageUrl: dto.imageUrl,
      description: dto.description,
      attributes: dto.attributes,
      requested: dto.requested,
      conditions: dto.conditions,
      notes: dto.notes,
      ingredients: dto.ingredients,
    }));

    return await this.dbService.query<DbProduct>(
      Map(
        newProducts,
        Lambda(['data'], Create(Collection('products'), { data: Var('data') })),
      ),
    );
  }

  async findAll(size = 1000) {
    const result = (await this.dbService.query<DbProduct>(
      Map(
        Paginate(Documents(Collection('products')), { size }),
        Lambda((x) => Get(x)),
      ),
    )) as DbProduct[];
    if (result) {
      return result;
    }
    return [];
  }

  async update(updateProductDto: UpdateProductDto) {
    return await this.dbService.query<DbProduct>(
      Update(
        Select(
          ['ref'],
          Get(Match(Index('product_by_id'), updateProductDto.id)),
        ),
        {
          data: updateProductDto,
        },
      ),
    );
  }

  async remove(id: string) {
    const result = (await this.dbService.query<DbProduct>(
      Delete(Select(['ref'], Get(Match(Index('product_by_id'), id)))),
    )) as DbProduct;
    if (!result) {
      throw new BadRequestException(
        `Product with id ${id} couldn't be deleted`,
      );
    }
    return result;
  }

  async uploadFilesToS3(files: {
    image: Express.Multer.File[];
    thumbnail: Express.Multer.File[];
  }) {
    try {
      const urls = [];
      const imgObjects = [];
      const key = uuid();
      for (const k in files) {
        if (Object.prototype.hasOwnProperty.call(files, k)) {
          const buffer = files[k][0].buffer;
          const extension = files[k][0].mimetype.split('/')[1];
          const fileKey = `product_img/${key}${
            k === 'image' ? '_lg' : ''
          }.${extension}`;
          const uploadResult = await this.uploadPublicFile(buffer, fileKey);
          if (!uploadResult.Key) {
            throw new InternalServerErrorException();
          }
          urls.push(fileKey);
          imgObjects.push({
            type: k,
            ext: extension,
            name: `${key}.${extension}`,
            url: `${this.configService.get(
              'AWS_CLOUDFRONT_DISTRIBUTION_URL',
            )}/product_img/${key}.${extension}`,
          });
        }
      }

      return imgObjects;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  async uploadPublicFile(
    dataBuffer: Buffer,
    key: string,
  ): Promise<S3.ManagedUpload.SendData> {
    if (!key) {
      key = uuid();
    }
    const AWS_REGION = this.configService.get('AWS_REGION');
    const BUCKET_NAME = this.configService.get('AWS_PUBLIC_BUCKET_NAME');
    const AWS_ACCESS_KEY_ID = this.configService.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = this.configService.get(
      'AWS_SECRET_ACCESS_KEY',
    );

    config.update({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    const s3 = new S3({ apiVersion: '2006-03-01' });
    const uploadResult = await s3
      .upload(
        {
          Bucket: BUCKET_NAME,
          Body: dataBuffer,
          Key: key,
        },
        {},
      )
      .promise();

    return uploadResult;
  }
}
