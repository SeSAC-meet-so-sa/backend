import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Query,
  Param,
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

  // 📌 아이템구매
  @UseGuards(JwtAuthGuard)
  @Post('buy/:itemId')
  async buyTheme(@Request() req, @Param('itemId') itemId: string) {
    return this.storeService.buyItem(req.user.sub, itemId);
  }

  // 📌 현재 아이템 변경 (ID 사용)
  @UseGuards(JwtAuthGuard)
  @Post('change/:itemId')
  async changeItem(@Request() req, @Param('itemId') itemId: string) {
    return this.storeService.changeItem(req.user.sub, itemId);
  }

  // 📌 사용자가 구매한 아이템 목록 조회
  @UseGuards(JwtAuthGuard)
  @Get('my-items')
  async getMyItems(@Request() req) {
    return this.storeService.getMyItems(req.user.sub);
  }
}
