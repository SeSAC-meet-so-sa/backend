import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '사용자 이름', example: 'seongwon' })
  readonly username: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  readonly password: string;
}
