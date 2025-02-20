import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ItemType } from './schemas/item.schema';

@Controller('store') // store 경로에서 관리
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('themes')
  async getThemes() {
    return this.storeService.getItemsByType(ItemType.THEME);
  }

  @Get('fonts')
  async getFonts() {
    return this.storeService.getItemsByType(ItemType.FONT);
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
