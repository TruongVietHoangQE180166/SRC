import { IsString, IsArray, ValidateNested, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class CreateAnswerDto {
  @IsString({ message: 'Answer text must be a string' })
  @IsNotEmpty({ message: 'Answer text is required' })
  text: string;

  @IsOptional()
  @IsNumber({}, { message: 'isCorrect must be a boolean value (true or false)' })
  isCorrect?: boolean;
}

class CreateQuestionDto {
  @IsString({ message: 'Question text must be a string' })
  @IsNotEmpty({ message: 'Question text is required' })
  text: string;

  @IsOptional()
  @IsNumber({}, { message: 'Time limit must be a number' })
  @Min(10, { message: 'Time limit must be at least 10 seconds' })
  @Max(300, { message: 'Time limit cannot exceed 300 seconds' })
  timeLimit?: number;

  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

export class CreateQuizDto {
  @IsString({ message: 'Quiz title must be a string' })
  @IsNotEmpty({ message: 'Quiz title is required' })
  title: string;

  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total test time must be a number' })
  @Min(10, { message: 'Total test time must be at least 10 seconds' })
  totalTestTime?: number;
}
