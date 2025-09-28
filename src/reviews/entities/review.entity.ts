import { Series } from '@app/series/entities/series.entity';
import { User } from '@app/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
  createdBy: User;

  @ManyToOne(() => Series)
  @JoinColumn({ name: 'series_id', referencedColumnName: 'id' })
  forSeries: Series;

  @Column()
  score: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
