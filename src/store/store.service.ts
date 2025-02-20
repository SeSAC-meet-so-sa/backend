import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument, ItemType } from './schemas/item.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
    private readonly userService: UserService,
  ) {}

  /** 모든 아이템 목록 조회 (테마 or 폰트) */
  async getItemsByType(type: ItemType) {
    return this.itemModel.find({ type }).select('-__v').exec();
  }

  /** 아이템 구매 & 포인트 차감 */
  async buyItem(userId: string, itemName: string, type: ItemType) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const item = await this.itemModel.findOne({ name: itemName, type }).exec();
    if (!item) throw new NotFoundException(`${type} not found`);

    if (user.purchasedItems.includes(itemName)) {
      throw new BadRequestException(`이미 구매한 ${type}입니다.`);
    }

    if (user.points < item.price) {
      throw new BadRequestException('포인트가 부족합니다.');
    }

    // 포인트 차감 및 아이템 추가
    user.points -= item.price;
    user.purchasedItems.push(itemName);
    await user.save();

    return {
      message: `${itemName} 구매 완료`,
      remainingPoints: user.points,
      purchasedItems: user.purchasedItems,
    };
  }

  /** 현재 적용 아이템 변경 */
  async changeItem(userId: string, itemName: string, type: ItemType) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.purchasedItems.includes(itemName)) {
      throw new BadRequestException(`해당 ${type}을 구매하지 않았습니다.`);
    }

    if (type === ItemType.THEME) {
      user.activeTheme = itemName;
    } else if (type === ItemType.FONT) {
      user.activeFont = itemName;
    }

    await user.save();
    return {
      message: `${itemName} 변경 완료`,
      activeTheme: user.activeTheme,
      activeFont: user.activeFont,
    };
  }
}
