import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ItemType } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';

@Controller('store') // store 경로에서 관리
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 📌 아이템 추가
  @Post()
  async createItem(@Body() createItemDto: CreateItemDto) {
    return this.storeService.createItem(createItemDto);
  }

  // 📌 아이템 목록 조회 (폰트 & 테마 필터 가능)
  @Get()
  async getAllItems(@Query('type') type?: ItemType) {
    return this.storeService.getAllItems(type);
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy-theme')
  async buyTheme(@Request() req, @Body('theme') theme: string) {
    return this.storeService.buyItem(req.user.sub, theme, ItemType.THEME);
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy-font')
  async buyFont(@Request() req, @Body('font') font: string) {
    return this.storeService.buyItem(req.user.sub, font, ItemType.FONT);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-theme')
  async changeTheme(@Request() req, @Body('theme') theme: string) {
    return this.storeService.changeItem(req.user.sub, theme, ItemType.THEME);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-font')
  async changeFont(@Request() req, @Body('font') font: string) {
    return this.storeService.changeItem(req.user.sub, font, ItemType.FONT);
  }
}
