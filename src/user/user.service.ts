import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MoodEntry } from './schemas/moodEntry.schema';
import { CreateMoodDto } from './dto/create-mood.dto';

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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async updatePoints(userId: string, delta: number): Promise<User | null> {
    // delta 값을 더하거나 뺌
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { points: delta } }, // points 필드를 delta만큼 증가 또는 감소
        { new: true }, // 업데이트된 문서를 반환
      )
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

  async addOrUpdateMoodEntry(
    userId: string,
    createMoodDto: CreateMoodDto,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new Error('User not found');
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
      throw new Error('User not found');
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
      throw new Error('User not found');
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
}
