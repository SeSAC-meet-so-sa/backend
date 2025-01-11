import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Body('content') content: string,
    @Body('author') author: string,
    @Body('boardId') boardId: string,
    @Body('parentCommentId') parentCommentId: string,
  ) {
    return this.commentService.createComment(
      content,
      author,
      boardId,
      parentCommentId,
    );
  }

  @Get(':boardId')
  async getComments(@Param('boardId') boardId: string) {
    return this.commentService.getCommentsByBoard(boardId);
  }

  @Get('replies/:parentCommentId')
  async getReplies(@Param('parentCommentId') parentCommentId: string) {
    return this.commentService.getReplies(parentCommentId);
  }

  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    return this.commentService.updateComment(commentId, content);
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string) {
    return this.commentService.deleteCommentAndReplies(commentId);
  }
}
