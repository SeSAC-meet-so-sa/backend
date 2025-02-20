import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
      author: new Types.ObjectId(author),
      boardId: new Types.ObjectId(boardId),
      parentCommentId: parentCommentId
        ? new Types.ObjectId(parentCommentId)
        : null,
    });
    return newComment.save();
  }

  async getComments(boardId: string) {
    return this.commentModel
      .find({ boardId: new Types.ObjectId(boardId), parentCommentId: null })
      .populate('author', 'username profileImage')
      .exec()
      .then((comments) =>
        comments.map((comment) =>
          comment.isDeleted
            ? { ...comment.toObject(), content: '삭제된 댓글입니다' }
            : comment,
        ),
      );
  }

  async getReplies(parentCommentId: string) {
    return this.commentModel
      .find({ parentCommentId: new Types.ObjectId(parentCommentId) })
      .populate('author', 'username profileImage')
      .exec();
  }

  async updateComment(commentId: string, content: string) {
    return this.commentModel
      .findByIdAndUpdate(commentId, { content }, { new: true })
      .exec();
  }

  async deleteCommentAndReplies(commentId: string) {
    const hasReplies = await this.commentModel
      .exists({ parentCommentId: commentId })
      .exec();

    if (hasReplies) {
      return this.commentModel
        .findByIdAndUpdate(commentId, { isDeleted: true })
        .exec();
    } else {
      return this.commentModel.findByIdAndDelete(commentId).exec();
    }
  }
}
