import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type UserDocument = User & Document;

@Schema()
export class MoodEntry {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  mood: string;

  @Prop()
  memo: string;
}

export const MoodEntrySchema = SchemaFactory.createForClass(MoodEntry);
