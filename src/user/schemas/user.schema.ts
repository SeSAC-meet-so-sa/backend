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

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  followers: Types.ObjectId[]; // 나를 팔로우한 유저

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  following: Types.ObjectId[]; // 내가 팔로우하는 유저

  @Prop({ type: [String], default: [] })
  purchasedThemes: string[]; // 구매한 테마 목록

  @Prop({ type: String, default: null })
  activeTheme: string; // 현재 적용 중인 테마

  @Prop({ type: [String], default: [] })
  purchasedFonts: string[]; // 구매한 폰트 목록

  @Prop({ type: String, default: null })
  activeFont: string; // 현재 적용 중인 폰트
}

export const UserSchema = SchemaFactory.createForClass(User);
