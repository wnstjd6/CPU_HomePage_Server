import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  name!: string;

  @Column({ type: 'varchar', length: 8 })
  studentId!: string;

  @Column({ type: 'varchar', length: 13 })
  phone!: string;

  @Column({ type: 'varchar', length: 80 })
  email!: string;

  @Column({ type: 'boolean', default: false })
  isDormitory!: boolean;

  @Column({ type: 'varchar', length: 4, nullable: true })
  room?: string;

  @Column({ type: 'varchar', length: 1000 })
  motivation!: string;

  @Column({ type: 'varchar', length: 1000 })
  strengthWeakness!: string;

  @Column({ type: 'varchar', length: 400 })
  expectedRole!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
