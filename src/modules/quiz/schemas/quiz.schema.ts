import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Answer extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isCorrect: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true })
  questionId: mongoose.Schema.Types.ObjectId;
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: 60, min: 10, max: 300 })
  timeLimit: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }], required: true })
  answers: mongoose.Schema.Types.ObjectId[];
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], required: true })
  questions: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: 1800 })
  totalTestTime: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
export const QuestionSchema = SchemaFactory.createForClass(Question);
export const AnswerSchema = SchemaFactory.createForClass(Answer);