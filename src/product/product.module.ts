import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Product.name, schema: ProductSchema }
      ]),
       forwardRef(() => AuthModule), 
    ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [
      ProductService,
      MongooseModule, 
    ],
})
export class ProductModule {}
