// question.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('add')
  async addQuestions(@Body('titles') titles: string[]) {
    return this.questionService.addQuestions(titles);
  }

  @Get('daily')
  async getDailyQuestion() {
    return this.questionService.getDailyQuestion();
  }
}
