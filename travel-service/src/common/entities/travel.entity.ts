import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Travel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.travels)
  user: User;

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: false })
  endDate: Date;

  @Column({ type: 'text', nullable: false })
  destination: string;

  @Column({ type: 'timestamp', nullable: true })
  proposedStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  proposedEndDate: Date;

  @Column({ type: 'text', nullable: true })
  proposedDestination: string;

  @Column({ type: 'timestamp', nullable: true })
  editRequestDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}