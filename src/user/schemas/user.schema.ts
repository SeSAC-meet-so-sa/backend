import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MoodEntry, MoodEntrySchema } from './moodEntry.schema';
import { PointHistory } from './pointHistory.schema';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: [] })
  bookmarks: string[];

  @Prop({ type: [Object], default: [] })
  moodEntries: MoodEntry[];

  @Prop({ type: [PointHistory], default: [] })
  pointHistory: PointHistory[];
}

export const UserSchema = SchemaFactory.createForClass(User);
