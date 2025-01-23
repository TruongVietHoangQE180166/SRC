import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, Question, Answer } from './schemas/quiz.schema';

// Interface for the repository
export interface IRepository<T> {
  create(item: T): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T>;
  update(id: string, item: T): Promise<T>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class QuizRepository implements IRepository<Quiz> {
  constructor(@InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>) {}

  async create(item: Quiz): Promise<Quiz> {
    const createdQuiz = new this.quizModel(item);
    return createdQuiz.save();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().exec();
  }

  async findOne(id: string): Promise<Quiz> {
    return this.quizModel.findById(id).exec();
  }

  async update(id: string, item: Quiz): Promise<Quiz> {
    return this.quizModel.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.quizModel.findByIdAndDelete(id).exec();
  }
}

@Injectable()
export class QuestionRepository implements IRepository<Question> {
  constructor(@InjectModel(Question.name) private readonly questionModel: Model<Question>) {}

  async create(item: Question): Promise<Question> {
    const createdQuestion = new this.questionModel(item);
    return createdQuestion.save();
  }

  async findAll(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

  async findOne(id: string): Promise<Question> {
    return this.questionModel.findById(id).exec();
  }

  async update(id: string, item: Question): Promise<Question> {
    return this.questionModel.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.questionModel.findByIdAndDelete(id).exec();
  }
}

@Injectable()
export class AnswerRepository implements IRepository<Answer> {
  constructor(@InjectModel(Answer.name) private readonly answerModel: Model<Answer>) {}

  async create(item: Answer): Promise<Answer> {
    const createdAnswer = new this.answerModel(item);
    return createdAnswer.save();
  }

  async findAll(): Promise<Answer[]> {
    return this.answerModel.find().exec();
  }

  async findOne(id: string): Promise<Answer> {
    return this.answerModel.findById(id).exec();
  }

  async update(id: string, item: Answer): Promise<Answer> {
    return this.answerModel.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.answerModel.findByIdAndDelete(id).exec();
  }
}