import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   * @param signupDto - username과 password를 포함
   * @returns 생성된 사용자 정보
   */
  async signup(SignupDto: SignupDto): Promise<User> {
    const { username, password } = SignupDto;

    // 중복 사용자 체크
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
    });

    return newUser.save();
  }

  /**
   * 로그인
   * @param loginDto - username과 password를 포함
   * @returns JWT 액세스 토큰
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { username, password } = loginDto;

    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 생성
    const payload = { username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    // NOTE : signAsync
    return { accessToken };
  }
}
