import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from './application/application.module';
import { QuestionModule } from './question/question.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ApplicationModule,
    QuestionModule,
  ],
})
export class AppModule {}
