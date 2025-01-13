import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MoodEntry } from './schemas/moodEntry.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async addMoodEntry(
    userId: string,
    moodEntry: MoodEntry,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { moodEntries: moodEntry } },
        { new: true },
      )
      .exec();
  }

  async updatePoints(userId: string, points: number): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { $inc: { points } }, { new: true })
      .exec();
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
}
