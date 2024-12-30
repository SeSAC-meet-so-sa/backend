import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['*'],
    exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
