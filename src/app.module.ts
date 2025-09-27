// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UsersModule } from './users/users.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { RatingsModule } from './ratings/ratings.module';
import { SeriesModule } from './series/series.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...dataSourceOptions,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'local', // sync only local
      }),
    }),
    ConfigifyModule.forRootAsync(),
    UsersModule,
    AuthModule,
    RatingsModule,
    SeriesModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_PIPE, useClass: ZodValidationPipe }, AppService],
})
export class AppModule {}
