import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig } from './config/database.config';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    
    AuthModule, 
    ProductModule, 
    OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
