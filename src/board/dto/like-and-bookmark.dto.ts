import { IsString } from 'class-validator';

export class ToggleBookmarkDto {
  @IsString()
  boardId: string;
}
export class ToggleLikeDto {
  @IsString()
  boardId: string;
}
