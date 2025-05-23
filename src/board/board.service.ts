import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { S3Service } from 'src/s3/s3.service';
import { ToggleBookmarkDto, ToggleLikeDto } from './dto/like-and-bookmark.dto';
import { SortOrder } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { BoardWithAuthorDto } from './dto/board-with-author.dto';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
  ) {}

  // async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
  //   const createBoard = new this.boardModel(createBoardDto);
  //   const result = await createBoard.save();
  //   console.log(result);
  //   return result;
  // }

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const { title, content, images, visibility, author } = createBoardDto;
    const imageUrls = [];
    const resolvedTitle =
      title || (await this.questionService.getDailyQuestion()).title;

    // S3에 이미지를 업로드해봅시다
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await this.s3Service.uploadFile(image);
        imageUrls.push(url);
      }
    }

    // 새로운 게시물을 생성해봅시다....
    const newBoard = new this.boardModel({
      title: resolvedTitle,
      content,
      images: imageUrls,
      visibility,
      author: new Types.ObjectId(author), // ObjectId로 변환
    });
    return newBoard.save();
  }

  async getBoards() {
    return this.boardModel.find().exec();
  }

  async getBoardById(boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board #${boardId} not found`);
    }

    const author = Types.ObjectId.isValid(board.author)
      ? await this.userService.findById(board.author)
      : null;
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const userMood = await this.userService.getUserMoodForDate(
      board.author,
      new Date(board.createdAt), // 작성일의 무드 정보 가져오기
    );

    // 조회수 증가
    board.viewCount += 1;
    await board.save();

    return {
      id: board.id,
      title: board.title,
      content: board.content,
      images: board.images,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      visibility: board.visibility,
      likes: board.likes,
      bookmarks: board.bookmarks,
      viewCount: board.viewCount,
      author: {
        id: author.id,
        username: author.username,
        profileImage: author.profileImage,
        description: author.description,
        mood: userMood, // 작성일의 무드 정보
      },
      likesCount: board.likes.length,
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

  async searchBoards(
    query: string,
    page: number = 1,
    limit: number = 12,
    sort: string = 'latest',
  ): Promise<{ boards: any[]; total: number }> {
    const filter: any = {};

    // 제목과 내용에서 검색
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
    ];

    // 작성자 검색
    if (Types.ObjectId.isValid(query)) {
      filter.$or.push({ author: new Types.ObjectId(query) });
    } else {
      filter.$or.push({ author: { $regex: query, $options: 'i' } });
    }

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

    // 정렬 옵션 설정
    const sortOption: { [key: string]: SortOrder } =
      sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

    // 전체 문서 개수 조회 (페이지네이션을 위한 total count)
    const total = await this.boardModel.countDocuments(filter);

    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    if (skip >= total) {
      return { boards: [], total };
    }

    // 검색된 게시글 목록 가져오기

    // 검색된 게시글 목록 가져오기 (author 정보 포함)
    const boards = await this.boardModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'id username profileImage',
        transform: (doc) => (doc ? doc.toObject() : null), // Null 처리 방지
      })
      .exec();

    const result = await Promise.all(
      boards.map(async (board) => {
        const author = await this.userService.findById(board.author);
        if (!author) {
          return {
            id: board.id,
            title: board.title,
            content: board.content,
            images: board.images,
            createdAt: board.createdAt,
            author: null,
            likesCount: board.likes.length,
          };
        }

        const userMood = await this.userService.getUserMoodForDate(
          board.author,
          new Date(board.createdAt), // 작성일의 무드 정보 가져오기
        );
        return {
          id: board.id,
          title: board.title,
          content: board.content,
          images: board.images,
          createdAt: board.createdAt,
          visibility: board.visibility,
          likes: board.likes,
          author: {
            id: author.id,
            username: author.username,
            profileImage: author.profileImage,
            mood: userMood, // 작성일의 무드 정보
          },
          likesCount: board.likes.length,
        };
      }),
    );

    return { boards: result, total };
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
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const query = { author: new Types.ObjectId(userId) };

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

  async getAllBoards(page: number, sort: string) {
    const sortOption: { [key: string]: SortOrder } =
      sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };
    const limit = 12;
    const skip = (page - 1) * limit;
    // 전체 게시글 개수 조회
    const total = await this.boardModel.countDocuments();

    // 페이지 범위를 초과하면 빈 배열 반환
    if (skip >= total) {
      return { boards: [], total };
    }

    const boards = await this.boardModel
      .find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'id username profileImage',
        transform: (doc) => (doc ? doc.toObject() : null), // Null 처리 방지
      })
      .exec();

    if (!boards || boards.length === 0) {
      throw new NotFoundException('No boards found on this page');
    }

    const result = await Promise.all(
      boards.map(async (board) => {
        const author = await this.userService.findById(board.author);
        if (!author) {
          return {
            id: board.id,
            title: board.title,
            content: board.content,
            images: board.images,
            createdAt: board.createdAt,
            author: null,
            likesCount: board.likes.length,
          };
        }

        const userMood = await this.userService.getUserMoodForDate(
          board.author,
          new Date(board.createdAt), // 작성일의 무드 정보 가져오기
        );

        return {
          id: board.id,
          title: board.title,
          content: board.content,
          images: board.images,
          createdAt: board.createdAt,
          author: {
            id: author.id,
            username: author.username,
            profileImage: author.profileImage,
            mood: userMood,
          },
          likesCount: board.likes.length,
        };
      }),
    );

    return result;
  }
}
