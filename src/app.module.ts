import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from './application/application.module';
import { QuestionModule } from './question/question.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_MS || 60_000),
        limit: Number(process.env.RATE_LIMIT_LIMIT || 60),
      },
    ]),
    TypeOrmModule.forRoot(typeOrmConfig),
    ApplicationModule,
    QuestionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
