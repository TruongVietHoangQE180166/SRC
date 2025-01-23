import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig } from './config/database.config';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    
    AuthModule, 
    ProductModule, 
    OrderModule, 
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
