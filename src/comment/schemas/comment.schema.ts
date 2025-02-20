import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ type: String, ref: 'Comment', default: null })
  parentCommentId?: string; // 대댓글의 부모 댓글 ID

  @Prop({ required: true, type: String, ref: 'Board' })
  boardId: Types.ObjectId; // 게시글 ID

  @Prop({ default: false })
  isDeleted: boolean; // 삭제 플래그
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
