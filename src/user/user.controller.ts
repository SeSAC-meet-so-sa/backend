import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateMoodDto } from './dto/create-mood.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') userId: string,
    @Body() updatePasswordDto: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  @Patch(':id/profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfile(
    @Param('id') userId: string,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() updateData: { username?: string; description?: string },
  ) {
    let profileImageUrl: string | undefined;
    if (profileImage) {
      profileImageUrl = await this.s3Service.uploadFile(profileImage);
    }
    return this.userService.updateUserProfile(userId, {
      ...updateData,
      profileImage: profileImageUrl,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get(':id/mood')
  async findMoodByDate(
    @Param('id') userId: string,
    @Query('date') date: string,
  ) {
    return this.userService.findMoodByDate(userId, new Date(date));
  }

  @Post(':id/mood')
  async addMood(
    @Param('id') userId: string,
    @Body() createMoodDto: CreateMoodDto,
  ) {
    return this.userService.addOrUpdateMoodEntry(userId, createMoodDto);
  }

  @Patch(':id/mood')
  async updateMood(
    @Param('id') userId: string,
    @Body() createMoodDto: CreateMoodDto,
  ) {
    return this.userService.addOrUpdateMoodEntry(userId, createMoodDto);
  }

  @Delete(':id/mood')
  async deleteMood(
    @Param('id') userId: string,
    @Body() body: { date: string },
  ) {
    return this.userService.deleteMoodEntry(userId, new Date(body.date));
  }

  @Get(':id/moods')
  async getMoodsByMonth(
    @Param('id') userId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.userService.getMoodsByMonth(userId, year, month);
  }

  @Patch(':id/points')
  async updatePoints(
    @Param('id') userId: string,
    @Body() updatePointsDto: { delta: number; description: string },
  ) {
    const { delta, description } = updatePointsDto;
    return this.userService.updateUserPoints(userId, delta, description);
  }
}
