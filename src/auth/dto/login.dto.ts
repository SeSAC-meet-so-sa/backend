import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '사용자 이메일', example: 'test@test.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: '비밀번호', example: 'passwordtest' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
