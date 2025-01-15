import { IsString } from 'class-validator';

export class ToggleBookmarkDto {
  @IsString()
  postId: string;
}
export class ToggleLikeDto {
  @IsString()
  postId: string;
}
