import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ItemType {
  THEME = 'THEME',
  FONT = 'FONT',
}

@Schema()
export class Item {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: ItemType })
  type: ItemType; // THEME | FONT

  @Prop()
  description?: string;

  @Prop()
  previewUrl?: string;
}

export type ItemDocument = Item & Document;
export const ItemSchema = SchemaFactory.createForClass(Item);
