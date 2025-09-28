// main.ts
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { updateGlobalConfig } from 'nestjs-paginate';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppExceptionFilter } from './app-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  // for parsing cookies
  app.use(cookieParser());

  updateGlobalConfig({
    defaultLimit: 20,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Wongnok API')
    .setDescription('The Wongnok API: Food Recipe for you')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'accessToken',
    )
    .addSecurityRequirements('accessToken')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Swagger UI
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // add app-excpetion.filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AppExceptionFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
