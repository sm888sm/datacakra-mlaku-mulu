import { Entity, Column, PrimaryGeneratedColumn,  OneToMany } from 'typeorm';
import { Travel } from './travel.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  fullname: string;

  @Column()
  role: string;

  @OneToMany(() => Travel, Travel => Travel.user)
  travels: Travel[];
}