import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuid } from 'uuid';
import { DbProduct } from './entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { S3, config } from 'aws-sdk';
import { UpdateUnitsDto } from './dto/update-units.dto';
import { IDbUser } from '../shared/interfaces/db-user.interface';
import { FirestoreService } from '../db/firestore.service';
import { Collection } from '../db/collection.enum';
import { inspect } from 'util';
import { Multer } from 'multer';
// const AWS = require('aws-sdk');

@Injectable()
export class ProductsService {
  private logger = new Logger('ProductsService');
  constructor(
    private firestoreService: FirestoreService,
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
      rank,
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
      rank,
    };

    try {
      const result = await this.firestoreService.create(
        Collection.PRODUCTS,
        newProduct,
      );
      if (!result || !result.success) {
        throw new BadRequestException(
          `create failed: ${inspect({ result }, { depth: null })}`,
        );
      }

      return this.firestoreService.parseFirebaseResult(
        Collection.PRODUCTS,
        result,
      ) as DbProduct;
    } catch (error) {
      this.logger.error(`create error: ${inspect({ error }, { depth: null })}`);
    }
  }

  async createBulk(createProductDto: CreateProductDto[]) {
    const promises = createProductDto.map(async (dto) => {
      const newProduct = {
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
        rank: dto.rank,
      };

      try {
        const result = await this.firestoreService.create(
          Collection.PRODUCTS,
          newProduct,
        );

        if (!result || !result.success || !result.data) {
          throw new BadRequestException(
            `create failed ${inspect({ result }, { depth: null })}`,
          );
        }
        return this.firestoreService.parseFirebaseResult(
          Collection.PRODUCTS,
          result,
        ) as DbProduct;
      } catch (error) {
        this.logger.error(
          `createBulk error: ${inspect({ error }, { depth: null })}`,
        );
      }
    });

    try {
      const products = await Promise.all(promises);
      return products.filter((p) => !!p);
    } catch (error) {
      this.logger.error(
        `createBulk error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.firestoreService.getOne(
        Collection.PRODUCTS,
        id,
      );
      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `findOne failed: ${inspect({ result }, { depth: null })}`,
        );
      }

      return this.firestoreService.parseFirebaseResult(
        Collection.PRODUCTS,
        result,
      ) as DbProduct;
    } catch (error) {
      this.logger.error(
        `findOne error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async findAll() {
    try {
      const result = await this.firestoreService.get(Collection.PRODUCTS);
      if (!result || !result.success || !result.data) {
        throw new BadRequestException(
          `FindAll failed: ${inspect({ result }, { depth: null })}`,
        );
      }
      return this.firestoreService.parseFirebaseResult(
        Collection.PRODUCTS,
        result,
      ) as DbProduct[];
    } catch (error) {
      this.logger.error(
        `findAll error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async update(updateProductDto: UpdateProductDto) {
    try {
      const { id } = updateProductDto;
      return (await this.firestoreService.update(
        Collection.PRODUCTS,
        id,
        updateProductDto,
      )) as DbProduct;
    } catch (error) {
      this.logger.error(`update error: ${inspect({ error }, { depth: null })}`);
    }
  }

  async updateUnits(user: IDbUser, updateUnitsDto: UpdateUnitsDto) {
    try {
      const product = await this.findOne(updateUnitsDto.id);
      if (!product) {
        throw new BadRequestException(`Product not found`);
      }
      const userUnits = user.unitsOwnedIds;
      // validate users units
      updateUnitsDto.unitsAvailable.map((unitId) => {
        if (!userUnits.includes(unitId)) {
          throw new BadRequestException(`User doesn't own unit ${unitId}`);
        }
      });

      const mergedUnits = new Set([
        ...product.unitsAvailable,
        ...updateUnitsDto.unitsAvailable,
      ]);

      const updatedUnits: string[] = [...mergedUnits].reduce(
        (previousValue, currentValue, _, array) => {
          if (!array.includes(currentValue)) {
            return [...previousValue, currentValue];
          }

          if (updateUnitsDto.unitsAvailable.includes(currentValue)) {
            return [...previousValue, currentValue];
          }

          return [...previousValue];
        },
        [],
      );

      const updatedProduct: UpdateProductDto = {
        id: updateUnitsDto.id,
        unitsAvailable: updatedUnits,
      };

      return await this.update(updatedProduct);
    } catch (error) {
      this.logger.error(
        `updateUnits error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const result = await this.firestoreService.delete(
        Collection.PRODUCTS,
        id,
      );
      if (!result) {
        throw new BadRequestException(`remove failed: ${{ result, id }}`);
      }
    } catch (error) {
      this.logger.error(
        `updateUnits error: ${inspect({ error }, { depth: null })}`,
      );
    }
  }

  async uploadFilesToS3(files: {
    image: Multer.File[];
    thumbnail: Multer.File[];
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
