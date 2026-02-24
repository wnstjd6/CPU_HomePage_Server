import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ApplicationEntity } from '../application/entities/application.entity';
import { QuestionEntity } from '../question/entities/question.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cpu',
  entities: [ApplicationEntity, QuestionEntity],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  timezone: '+09:00',
};
