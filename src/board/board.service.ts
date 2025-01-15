import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { S3Service } from 'src/s3/s3.service';
import { ToggleBookmarkDto, ToggleLikeDto } from './dto/like-and-bookmark.dto';
import { SortOrder } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { BoardWithAuthorDto } from './dto/board-with-author.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}

  // async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
  //   const createBoard = new this.boardModel(createBoardDto);
  //   const result = await createBoard.save();
  //   console.log(result);
  //   return result;
  // }

  async createBoard(createBoardDto: CreateBoardDto) {
    const { title, content, images, visibility, author } = createBoardDto;
    const imageUrls = [];

    // S3에 이미지를 업로드해봅시다
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await this.s3Service.uploadFile(image);
        imageUrls.push(url);
      }
    }

    // 새로운 게시물을 생성해봅시다....
    const newBoard = new this.boardModel({
      title,
      content,
      images: imageUrls,
      visibility,
      author,
    });
    return newBoard.save();
  }

  async getBoards() {
    return this.boardModel.find().exec();
  }

  async getBoardById(boardId: string): Promise<BoardWithAuthorDto> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board #${boardId} not found`);
    }

    const author = await this.userService.findById(board.author);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // 조회수 증가
    board.viewCount += 1;
    await board.save();

    return {
      title: board.title,
      content: board.content,
      images: board.images,
      visibility: board.visibility,
      likes: board.likes,
      bookmarks: board.bookmarks,
      viewCount: board.viewCount,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      author: {
        username: author.username,
        profileImage: author.profileImage,
        description: author.description,
      },
    };
  }

  async updateBoard(boardId: string, updateBoardDto: UpdateBoardDto) {
    const updated = await this.boardModel
      .findByIdAndUpdate(boardId, updateBoardDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Board #${boardId} not found`);
    }
    return updated;
  }

  async deleteBoard(boardId: string) {
    const deleted = await this.boardModel.findByIdAndDelete(boardId).exec();
    if (!deleted) {
      throw new NotFoundException(`Board #${boardId} not found`);
    }
    return deleted;
  }

  async searchBoards(query: string): Promise<Board[]> {
    const filter: any = {};

    // 제목과 내용에서 검색
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
    ];

    // 작성자로 검색
    if (query.includes('author:')) {
      const authorMatch = query.match(/author:(\S+)/);
      if (authorMatch) {
        filter.author = authorMatch[1];
      }
    }

    // 날짜로 검색
    if (query.includes('startDate:') || query.includes('endDate:')) {
      filter.createdAt = {};

      const startDateMatch = query.match(/startDate:(\S+)/);
      if (startDateMatch) {
        filter.createdAt.$gte = new Date(startDateMatch[1]);
      }

      const endDateMatch = query.match(/endDate:(\S+)/);
      if (endDateMatch) {
        filter.createdAt.$lte = new Date(endDateMatch[1]);
      }
    }
    return this.boardModel.find(filter).exec();
  }

  async toggleBookmark(userId: string, toggleBookmarkDto: ToggleBookmarkDto) {
    const { boardId } = toggleBookmarkDto;
    const board = await this.boardModel.findById(boardId);
    if (!board) throw new Error('Post not found');

    const isBookmarked = board.bookmarks.includes(userId);
    if (isBookmarked) {
      board.bookmarks = board.bookmarks.filter((id) => id !== userId);
    } else {
      board.bookmarks.push(userId);
    }
    await board.save();
    return { message: isBookmarked ? 'Bookmark removed' : 'Bookmark added' };
  }

  async toggleLike(userId: string, toggleLikeDto: ToggleLikeDto) {
    const { boardId } = toggleLikeDto;
    const board = await this.boardModel.findById(boardId);
    if (!board) throw new Error('Post not found');

    const isLiked = board.likes.includes(userId);
    if (isLiked) {
      board.likes = board.likes.filter((id) => id !== userId);
    } else {
      board.likes.push(userId);
    }
    await board.save();

    return { message: isLiked ? 'Like removed' : 'Like added' };
  }

  async getBookmarkedPosts(userId: string, search: string) {
    const query = { bookmarks: userId };
    if (search) {
      query['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    return this.boardModel.find(query).select('title content author createdAt');
  }

  async getMyPosts(userId: string, search: string) {
    const query = { author: userId };

    // console.log('User ID:', userId);
    // console.log('Query:', query);

    if (search) {
      query['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    return this.boardModel.find(query).select('title content author createdAt');
  }

  async getAllPosts(page: number, sort: string) {
    const sortOption: { [key: string]: SortOrder } =
      sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };
    const limit = 12;
    const skip = (page - 1) * limit;
    return this.boardModel
      .find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('title content author likes bookmarks createdAt');
  }
}
