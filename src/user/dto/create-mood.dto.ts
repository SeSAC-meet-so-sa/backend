// create-mood.dto.ts
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateMoodDto {
  @IsString()
  @IsIn(['joy', 'sadness', 'anger', 'tired', 'neutral'])
  mood: string;

  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  memo?: string;
}
