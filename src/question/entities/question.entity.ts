import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 1000 })
  question!: string;

  @Column({ type: 'varchar', length: 1000, default: '' })
  answer!: string;
}
