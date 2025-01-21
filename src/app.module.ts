import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig } from './config/database.config';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    
    AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
