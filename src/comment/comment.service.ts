import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Comment, CommentDocument } from './schemas/comment.schema';
@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(
    content: string,
    author: string,
    boardId: string,
    parentCommentId?: string,
  ) {
    const newComment = new this.commentModel({
      content,
      author,
      boardId,
      parentCommentId,
    });
    return newComment.save();
  }

  async getCommentsByBoard(boardId: string) {
    return this.commentModel
      .find({ boardId, parentCommentId: null })
      .populate('parentCommentId')
      .exec();
  }
  async getReplies(parentCommentId: string) {
    return this.commentModel.find({ parentCommentId }).exec();
  }
  async updateComment(commentId: string, content: string) {
    return this.commentModel
      .findByIdAndUpdate(commentId, { content }, { new: true })
      .exec();
  }
  async deleteCommentAndReplies(commentId: string) {
    await this.commentModel.deleteMany({ parentCommentId: commentId }).exec();
    return this.commentModel.findByIdAndDelete(commentId).exec();
  }
  // NOTE : 댓글 삭제하면 답글도 삭제? 아님 '삭제된 댓글입니다'라고만 띄울까
}
