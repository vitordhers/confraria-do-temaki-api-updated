import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DbModule } from '../db/firestore.module';

@Module({
  imports: [DbModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
