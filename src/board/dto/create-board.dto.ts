// src/board/dto/create-board.dto.ts
export class CreateBoardDto {
  title: string;
  content: string;
  images?: Express.Multer.File[];
  visibility: 'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC';
  author: string;
}
