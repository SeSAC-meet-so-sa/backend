import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MoodEntry, MoodEntrySchema } from './moodEntry.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: [] })
  bookmarks: string[];

  @Prop({ type: [MoodEntrySchema], default: [] })
  moodEntries: Types.Array<MoodEntry>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = this._id.toString();
  }
  next();
});
