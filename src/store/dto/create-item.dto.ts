import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ItemType } from '../schemas/item.schema';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ItemType)
  type: ItemType;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  previewUrl?: string;
}
