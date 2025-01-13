import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '사용자 이메일', example: 'test@test.com' })
  readonly email: string;

  @ApiProperty({ description: '비밀번호', example: 'passwordtest' })
  readonly password: string;
}
