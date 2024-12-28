import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
}
