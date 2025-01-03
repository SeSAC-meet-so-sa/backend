import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'], // 허용할 도메인
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Nextream')
      .setDescription('Nextream API 명세서')
      .setVersion('1.2')
      .addBearerAuth()
      .addBasicAuth()
      .build(),
  );
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
