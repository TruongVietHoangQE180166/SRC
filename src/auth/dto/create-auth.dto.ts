import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsBoolean,
    IsMongoId,
    MinLength,
    Matches,
    IsEnum,
    IsOptional,
    IsNumber,
    IsDate,
    IsDateString
  } from 'class-validator';
  
  export class CreateAuthDto {
    @IsNumber({}, { message: 'ID must be a number' })
    @IsNotEmpty({ message: 'ID is required' })
    id: number;
  
    @IsEmail({}, { message: 'Invalid email format.' })
    @IsNotEmpty({ message: 'Email is required.' })
    email: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message:
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.',
    })
    password: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Please confirm your password.' })
    repassword: string;
   
  }