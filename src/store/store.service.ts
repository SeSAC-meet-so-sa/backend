import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item, ItemDocument, ItemType } from './schemas/item.schema';
import { UserService } from 'src/user/user.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
    private readonly userService: UserService,
  ) {}

  // 📌 아이템 생성
  async createItem(createItemDto: CreateItemDto): Promise<Item> {
    const newItem = new this.itemModel(createItemDto);
    return newItem.save();
  }

  // 📌 모든 아이템 조회
  async getAllItems(type?: ItemType): Promise<Item[]> {
    const query = type ? { type } : {}; // type이 있을 경우 필터링
    return this.itemModel.find(query).exec();
  }

  /** 아이템 구매 & 포인트 차감 */
  async buyItem(userId: string, itemId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    const item = await this.itemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException(`Item not found`);

    if (user.purchasedItems.includes(itemId)) {
      throw new BadRequestException(`이미 구매한 아이템입니다.`);
    }

    if (user.points < item.price) {
      throw new BadRequestException('포인트가 부족합니다.');
    }

    // 포인트 차감 및 히스토리 저장
    await this.userService.updateUserPoints(
      userId,
      -item.price,
      `${item.name} 구매`,
    );
    // 아이템 추가
    user.purchasedItems.push(itemId);
    await user.save();

    return {
      message: `${item.name} 구매 완료`,
      remainingPoints: user.points,
      purchasedItems: user.purchasedItems,
    };
  }

  /** 현재 적용 아이템 변경 */
  async changeItem(userId: string, itemId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    const item = await this.itemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Item not found');

    if (!user.purchasedItems.includes(itemId)) {
      throw new BadRequestException(`해당 아이템을 구매하지 않았습니다.`);
    }

    if (item.type === ItemType.THEME) {
      user.activeTheme = itemId;
    } else if (item.type === ItemType.FONT) {
      user.activeFont = itemId;
    }

    await user.save();
    return {
      message: `${item.name} 변경 완료`,
      activeTheme: user.activeTheme,
      activeFont: user.activeFont,
    };
  }

  async getMyItems(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const items = await this.itemModel
      .find({ _id: { $in: user.purchasedItems } })
      .exec();
    return items;
  }
}
