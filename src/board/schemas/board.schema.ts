// src/board/schemas/board.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Board {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    required: true,
    enum: ['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'],
    default: 'PUBLIC',
  })
  visibility: string;

  @Prop({ default: [] })
  likes: string[];

  @Prop({ default: [] })
  bookmarks: string[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
export type BoardDocument = Board & Document;
