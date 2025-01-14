import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiProperty({
    description: '수정된 게시글 내용',
    example: '수정된 내용입니다.',
  })
  content: string;

  @ApiProperty({
    description: '수정된 이미지 파일 배열',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  images?: Express.Multer.File[];

  @ApiProperty({
    description: '게시글 공개 범위',
    enum: ['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'],
    example: 'FRIENDS_ONLY',
  })
  visibility: 'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC';
}
