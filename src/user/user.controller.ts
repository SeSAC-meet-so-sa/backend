import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateMoodDto } from './dto/create-mood.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
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
}
