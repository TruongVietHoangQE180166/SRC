import { Module, forwardRef} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema, Question, QuestionSchema, Answer, AnswerSchema} from './schemas/quiz.schema';
import { AuthModule } from '../auth/auth.module';
import { QuizRepository, QuestionRepository, AnswerRepository } from './quiz.repositories';
@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Quiz.name, schema: QuizSchema}, 
      {name: Question.name, schema: QuestionSchema},
      {name: Answer.name, schema: AnswerSchema}
    ]),
    forwardRef(() => AuthModule), 
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository, QuestionRepository, AnswerRepository],
  exports: [QuizService, QuizRepository, QuestionRepository, AnswerRepository],
})
export class QuizModule {}
