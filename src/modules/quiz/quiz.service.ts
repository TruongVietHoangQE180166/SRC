import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, Question, Answer } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Answer.name) private answerModel: Model<Answer>
  ) {}

  // Create a new quiz
  async create(createDto: CreateQuizDto): Promise<Quiz> {
    try {
      const savedQuestions = await Promise.all(
        createDto.questions.map(async (questionData) => {
          const savedAnswers = await Promise.all(
            questionData.answers.map(async (answerData) => {
              return new this.answerModel({
                text: answerData.text,
                isCorrect: answerData.isCorrect || false,
              }).save();
            })
          );

          return new this.questionModel({
            text: questionData.text,
            timeLimit: questionData.timeLimit || 60,
            answers: savedAnswers.map((a) => a._id),
          }).save();
        })
      );

      return new this.quizModel({
        title: createDto.title,
        questions: savedQuestions.map((q) => q._id),
        totalTestTime: createDto.totalTestTime || 1800,
      }).save();
    } catch (error) {
      throw new BadRequestException(`Quiz creation failed: ${error.message}`);
    }
  }

  // Get all quizzes with pagination
  async findAll(page: number, limit: number): Promise<{ data: Quiz[]; total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.quizModel
        .find()
        .populate({
          path: 'questions',
          populate: { path: 'answers' },
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.quizModel.countDocuments(),
    ]);

    return { data, total };
  }

  // Get a single quiz by ID with full details
  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel
      .findById(id)
      .populate({
        path: 'questions',
        populate: { path: 'answers' },
      })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  // Update an existing quiz
  async update(id: string, updateDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    try {
      if (updateDto.questions) {
        const updatedQuestions = await Promise.all(
          updateDto.questions.map(async (questionDto) => {
            let question;
            if (questionDto._id) {
              question = await this.questionModel.findById(questionDto._id);
              if (!question) {
                throw new NotFoundException(`Question with ID ${questionDto._id} not found`);
              }
            } else {
              question = new this.questionModel();
            }

            question.text = questionDto.text || question.text;
            question.timeLimit = questionDto.timeLimit || question.timeLimit;

            if (questionDto.answers) {
              const savedAnswers = await Promise.all(
                questionDto.answers.map(async (answerDto) => {
                  if (answerDto._id) {
                    return this.answerModel.findByIdAndUpdate(
                      answerDto._id,
                      {
                        text: answerDto.text,
                        isCorrect: answerDto.isCorrect,
                      },
                      { new: true }
                    );
                  }
                  return new this.answerModel({
                    text: answerDto.text,
                    isCorrect: answerDto.isCorrect,
                  }).save();
                })
              );

              question.answers = savedAnswers.map((a) => a._id);
            }

            return question.save();
          })
        );

        quiz.questions = updatedQuestions.map((q) => q._id);
      }

      quiz.title = updateDto.title || quiz.title;
      quiz.totalTestTime = updateDto.totalTestTime || quiz.totalTestTime;

      return await quiz.save();
    } catch (error) {
      throw new BadRequestException(`Quiz update failed: ${error.message}`);
    }
  }

  // Remove a quiz
  async remove(id: string): Promise<void> {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    await Promise.all([
      this.questionModel.deleteMany({ _id: { $in: quiz.questions } }),
      this.answerModel.deleteMany({ questionId: { $in: quiz.questions } }),
    ]);

    await this.quizModel.findByIdAndDelete(id);
  }
}
