import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
     forwardRef(() => AuthModule), 
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}