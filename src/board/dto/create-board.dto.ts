import { ApiProperty } from '@nestjs/swagger';

// src/board/dto/create-board.dto.ts
export class CreateBoardDto {
  @ApiProperty({
    description: '질문',
    example: '가장 기억에 남는 일은 무엇인가요?',
  })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '오늘은 기분이 아주 좋습니다!',
  })
  content: string;

  @ApiProperty({
    description: '업로드된 이미지 파일 배열',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  images?: Express.Multer.File[];

  @ApiProperty({
    description: '게시글 공개 범위',
    enum: ['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'],
    example: 'PUBLIC',
  })
  visibility: 'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC';

  @ApiProperty({
    description: '작성자 이름',
    example: 'John Doe',
  })
  author: string;
}
