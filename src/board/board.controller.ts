import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './schemas/board.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ToggleBookmarkDto, ToggleLikeDto } from './dto/like-and-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardWithAuthorDto } from './dto/board-with-author.dto';

@ApiTags('Board')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('search')
  async searchBoards(@Query('query') query: string) {
    return this.boardService.searchBoards(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('toggle-bookmark')
  async toggleBookmark(
    @Request() req,
    @Body() toggleBookmarkDto: ToggleBookmarkDto,
  ) {
    const userId = req.user.sub;
    return this.boardService.toggleBookmark(userId, toggleBookmarkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('toggle-like')
  async toggleLike(@Request() req, @Body() toggleLikeDto: ToggleLikeDto) {
    const userId = req.user.sub;
    return this.boardService.toggleLike(userId, toggleLikeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarked-posts')
  async getBookmarkedPosts(@Request() req, @Query('search') search: string) {
    const userId = req.user.sub;
    return this.boardService.getBookmarkedPosts(userId, search);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  async getMyPosts(@Request() req, @Query('search') search: string) {
    // console.log(req);
    const userId = req.user.sub;
    return this.boardService.getMyPosts(userId, search);
  }

  @Get('all-posts')
  async getAllPosts(@Query('page') page: number, @Query('sort') sort: string) {
    return this.boardService.getAllBoards(page, sort);
  }

  // @Post()
  // async create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
  //   return this.boardService.createBoard(createBoardDto);
  // }
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({
    summary: '게시글 생성',
    description: '새로운 게시글을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    type: Board,
  })
  @ApiBody({ type: CreateBoardDto })
  async createBoard(
    @Body() body: any, // Raw 데이터를 받음
    @UploadedFiles() images?: Express.Multer.File[], // 파일 데이터를 분리
  ) {
    const createBoardDto: CreateBoardDto = {
      ...body,
      images, // 업로드된 파일 배열 추가
    };
    return this.boardService.createBoard(createBoardDto);
  }

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '모든 게시글을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: [Board],
  })
  async findAll(): Promise<Board[]> {
    return this.boardService.getBoards();
  }

  @Get(':boardId')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글을 조회합니다.',
  })
  @ApiParam({
    name: 'boardId',
    description: '조회할 게시글의 ID',
    example: '60c72b2f9b1e8e3b88d8e99a',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 조회 성공',
    type: Board,
  })
  async findOne(
    @Param('boardId') boardId: string,
  ): Promise<BoardWithAuthorDto> {
    return this.boardService.getBoardById(boardId);
  }

  @Patch(':boardId')
  @ApiOperation({
    summary: '게시글 수정',
    description: '특정 게시글을 수정합니다.',
  })
  @ApiParam({
    name: 'boardId',
    description: '수정할 게시글의 ID',
    example: '60c72b2f9b1e8e3b88d8e99a',
  })
  @ApiBody({ type: UpdateBoardDto })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: Board,
  })
  async update(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    return this.boardService.updateBoard(boardId, updateBoardDto);
  }

  @Delete(':boardId')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '특정 게시글을 삭제합니다.',
  })
  @ApiParam({
    name: 'boardId',
    description: '삭제할 게시글의 ID',
    example: '60c72b2f9b1e8e3b88d8e99a',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    type: Board,
  })
  async remove(@Param('boardId') boardId: string): Promise<Board> {
    return this.boardService.deleteBoard(boardId);
  }
}
