import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_BUKET_NAME');
    const key = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // 공개 URL
    };

    await this.s3.upload(params).promise();
    return `https://${bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
  }
}
