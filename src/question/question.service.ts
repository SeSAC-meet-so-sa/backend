// question.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async addQuestions(titles: string[]): Promise<Question[]> {
    const questions = titles.map((title) => ({ title }));
    return this.questionModel.insertMany(questions);
  }

  async getDailyQuestion(): Promise<Question> {
    const count = await this.questionModel.countDocuments();
    if (count === 0) {
      throw new NotFoundException('No questions available');
    }

    const index = new Date().getDate() % count;
    return this.questionModel.findOne().skip(index).exec();
  }
}
