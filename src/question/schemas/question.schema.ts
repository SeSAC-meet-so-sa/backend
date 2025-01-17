import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
