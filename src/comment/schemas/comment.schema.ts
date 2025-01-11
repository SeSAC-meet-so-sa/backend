import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: String, ref: 'Comment', default: null })
  parentCommentId?: string; // 대댓글의 부모 댓글 ID

  @Prop({ required: true, type: String, ref: 'Board' })
  boardId: string; // 게시글 ID
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
