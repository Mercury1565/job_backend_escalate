import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Job } from './job.entity';
import { ApplicationStatus } from 'src/shared/enums/applicationStatus';

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  applicant: User;

  @ManyToOne(() => Job)
  job: Job;

  @Column()
  resumeLink: string;

  @Column({ nullable: true })
  coverLetter: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  appliedAt: Date;
}
