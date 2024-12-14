import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const createBoard = new this.boardModel(createBoardDto);
    const result = await createBoard.save();
    console.log(result);
    return result;
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.boardModel.findById(id).exec();
    if (!board) {
      throw new NotFoundException(`Board #${id} not found`);
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const updated = await this.boardModel.findByIdAndUpdate(
      id,
      updateBoardDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException(`Board #${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<Board> {
    const deleted = await this.boardModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Board #${id} not found`);
    }
    return deleted;
  }
}
