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
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * 유니크한 랜덤 username 생성
   */
  private async generateUniqueUsername(): Promise<string> {
    let username: string;
    let isUnique = false;

    while (!isUnique) {
      // 랜덤 문자열 생성 (8자리)
      username = `믿으미${uuidv4().slice(0, 8)}`;

      // 중복 여부 확인
      const existingUser = await this.userModel.findOne({ username });
      if (!existingUser) {
        isUnique = true;
      }
    }

    return username;
  }
  /**
   * 회원가입
   * @param signupDto - email과 password를 포함
   * @returns 생성된 사용자 정보
   */
  async signup(SignupDto: SignupDto): Promise<User> {
    const { email, password } = SignupDto;

    // 중복 사용자 체크
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('email already exists');
    }
    // 유니크한 username 생성
    const username = await this.generateUniqueUsername();

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    return newUser.save();
  }

  /**
   * 로그인
   * @param loginDto - email과 password를 포함
   * @returns JWT 액세스 토큰
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 생성
    const payload = { email, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    // NOTE : signAsync
    return { accessToken };
  }
}
