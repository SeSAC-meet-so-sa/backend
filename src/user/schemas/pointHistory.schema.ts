import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class PointHistory {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true, default: Date.now })
  date: Date;
}
