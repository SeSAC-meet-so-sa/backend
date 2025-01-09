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
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './schemas/board.schema';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // @Post()
  // async create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
  //   return this.boardService.createBoard(createBoardDto);
  // }
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
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
  async findAll(): Promise<Board[]> {
    return this.boardService.getBoards();
  }

  @Get(':boardId')
  async findOne(@Param('boardId') boardId: string): Promise<Board> {
    return this.boardService.getBoardById(boardId);
  }

  @Patch(':boardId')
  async update(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    return this.boardService.updateBoard(boardId, updateBoardDto);
  }

  @Delete(':boardId')
  async remove(@Param('boardId') boardId: string): Promise<Board> {
    return this.boardService.deleteBoard(boardId);
  }
}
