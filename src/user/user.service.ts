import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MoodEntry } from './schemas/moodEntry.schema';
import { CreateMoodDto } from './dto/create-mood.dto';
import * as bcrypt from 'bcryptjs';
import { SearchUsersDto } from './dto/search-users.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(MoodEntry.name) private moodModel: Model<MoodEntry>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  findAll() {
    return `This action returns all user`;
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateUserProfile(
    userId: string,
    updateData: {
      username?: string;
      description?: string;
      profileImage?: string;
    },
  ): Promise<Partial<User>> {
    // Check if the username already exists
    if (updateData.username) {
      const existingUser = await this.userModel
        .findOne({ username: updateData.username })
        .exec();

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BadRequestException('Username already exists');
      }
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select('username profileImage description')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      username: updatedUser.username,
      profileImage: updatedUser.profileImage,
      description: updatedUser.description,
    };
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async findMoodByDate(userId: string, date: Date): Promise<MoodEntry | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;
    return (
      user.moodEntries.find(
        (entry) =>
          entry.date.toISOString().split('T')[0] ===
          date.toISOString().split('T')[0],
      ) || null
    );
  }

  async addOrUpdateMoodEntry(
    userId: string,
    createMoodDto: CreateMoodDto,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new NotFoundException('User not found');
    const existingEntryIndex = user.moodEntries.findIndex(
      (entry) =>
        entry.date.toISOString().split('T')[0] ===
        new Date(createMoodDto.date).toISOString().split('T')[0],
    );

    console.log(existingEntryIndex);

    if (existingEntryIndex >= 0) {
      // Update the existing entry
      user.moodEntries[existingEntryIndex].mood = createMoodDto.mood;
      user.moodEntries[existingEntryIndex].memo = createMoodDto.memo || '';
    } else {
      // Add a new entry
      user.moodEntries.push({
        date: new Date(createMoodDto.date),
        mood: createMoodDto.mood,
        memo: createMoodDto.memo || '',
      } as MoodEntry);
    }

    return user.save();
  }

  async deleteMoodEntry(userId: string, date: Date): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter out the entry matching the given date
    user.moodEntries = user.moodEntries.filter(
      (entry) =>
        entry.date.toISOString().split('T')[0] !==
        date.toISOString().split('T')[0],
    );

    return user.save();
  }

  async getMoodsByMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<MoodEntry[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(year, month);

    // Filter mood entries by the specified month and year
    return user.moodEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() == year && entryDate.getMonth() + 1 == month // JavaScript months are 0-indexed
      );
    });
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: { oldPassword: string; newPassword: string },
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (updatePasswordDto.oldPassword === updatePasswordDto.newPassword) {
      throw new BadRequestException('Password is the same as current password');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();

    return { message: 'Password updated successfully' };
  }

  async updateUserPoints(
    userId: string,
    delta: number,
    description: string,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.points += delta;

    user.pointHistory.push({ description, points: delta, date: new Date() });
    return user.save();
  }

  async followUser(userId: string, targetUserId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    const targetUser = await this.userModel.findById(targetUserId).exec();

    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    if (user.following.some((id) => id.toString() === targetUserId)) {
      throw new BadRequestException('You are already following this user.');
    }
    user.following.push(new Types.ObjectId(targetUserId));
    targetUser.followers.push(new Types.ObjectId(userId));

    // 필요한 부분만 저장
    await this.userModel
      .updateOne({ _id: targetUserId }, { $push: { followers: userId } })
      .exec();
    await this.userModel
      .updateOne({ _id: userId }, { $push: { following: targetUserId } })
      .exec();

    return user;
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    const targetUser = await this.userModel.findById(targetUserId).exec();
    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // following 및 followers 업데이트
    await this.userModel
      .updateOne({ _id: userId }, { $pull: { following: targetUserId } })
      .exec();
    await this.userModel
      .updateOne({ _id: targetUserId }, { $pull: { followers: userId } })
      .exec();

    return user;
  }

  async checkFriendship(
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return (
      user.following.some((id) => (id) => id.toString() === targetUserId) &&
      user.followers.some((id) => (id) => id.toString() === targetUserId)
    );
  }

  async getFollowers(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('followers', 'username profileImage description')
      .exec();

    return user ? user.followers : [];
  }

  async getFollowing(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('following', 'username profileImage description')
      .exec();

    return user ? user.following : [];
  }

  async getFriends(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('followers', 'username profileImage description')
      .populate('following', 'username profileImage description')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 팔로워와 팔로잉 목록에서 교집합 추출
    const friends = user.followers.filter((follower) =>
      user.following.some(
        (following) => following._id.toString() === follower._id.toString(),
      ),
    );

    return friends;
  }

  async searchUsers(query: SearchUsersDto): Promise<User[]> {
    const filter: any = {};

    //  키워드 검색
    if (query.keyword) {
      filter.$or = [
        { username: { $regex: query.keyword, $options: 'i' } },
        { email: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    // 정렬 조건
    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    }

    // 페이지네이션
    const page = query.page || 1;
    const limit = query.limit || 5;
    const skip = (page - 1) * limit;

    // 쿼리 실행
    return this.userModel
      .find(filter)
      .select('username email profileImage description')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
