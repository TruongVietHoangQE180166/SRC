import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAccount, UserAccountSchema, DeviceToken, DeviceTokenSchema } from './schemas/account.schema';
import { UserAccountRepository, DeviceTokenRepository } from './auth.repositories';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
      {name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserAccountRepository, DeviceTokenRepository],
  exports: [
    AuthService,
    MongooseModule,
    UserAccountRepository, 
    DeviceTokenRepository
  ],
})
export class AuthModule {}
