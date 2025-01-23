import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      ...options, 
    });
  }
}
