import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './schemas/board.schema';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    S3Module,
    AuthModule,
    UserModule,
    QuestionModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
