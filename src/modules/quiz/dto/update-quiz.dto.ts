import { IsString, IsArray, ValidateNested, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsOptional()
  @IsString({ message: 'Answer text must be a string' })
  text?: string;

  @IsOptional()
  @IsNumber({}, { message: 'isCorrect must be a boolean value (true or false)' })
  isCorrect?: boolean;

  @IsOptional()
  @IsString({ message: 'Answer ID must be a string' })
  _id?: string;
}

class UpdateQuestionDto {
  @IsOptional()
  @IsString({ message: 'Question text must be a string' })
  text?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Time limit must be a number' })
  @Min(10, { message: 'Time limit must be at least 10 seconds' })
  @Max(300, { message: 'Time limit cannot exceed 300 seconds' })
  timeLimit?: number;

  @IsOptional()
  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers?: UpdateAnswerDto[];

  @IsOptional()
  @IsString({ message: 'Question ID must be a string' })
  _id?: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString({ message: 'Quiz title must be a string' })
  title?: string;

  @IsOptional()
  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total test time must be a number' })
  @Min(10, { message: 'Total test time must be at least 10 seconds' })
  totalTestTime?: number;
}
