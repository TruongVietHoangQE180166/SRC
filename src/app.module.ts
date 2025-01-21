import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig } from './config/database.config';
import { ProductModule } from './product/product.module';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    
    AuthModule, 
    ProductModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
