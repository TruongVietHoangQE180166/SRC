import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig } from './config/database.config';
import { QuizModule } from './modules/quiz/quiz.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    AuthModule, 
    QuizModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
