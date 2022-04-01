import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UnitsModule } from './units/units.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { CategoriesModule } from './categories/categories.module';
import { MessagesModule } from './messages/messages.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, './', 'frontend'),
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    UnitsModule,
    CategoriesModule,
    ProductsModule,
    UsersModule,
    MessagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
