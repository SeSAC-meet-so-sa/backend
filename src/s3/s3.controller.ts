import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required!');

    // 파일 정보 출력
    console.log('Uploaded file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const fileUrl = await this.s3Service.uploadFile(file);
    return { url: fileUrl };
  }
}
