import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MoodEntry extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  mood: string;

  @Prop()
  memo: string;
}

export const MoodEntrySchema = SchemaFactory.createForClass(MoodEntry);
