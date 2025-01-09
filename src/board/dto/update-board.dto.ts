export class UpdateBoardDto {
  content: string;
  images?: Express.Multer.File[];
  visibility: 'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC';
}
