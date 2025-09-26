import { Rating } from '@app/ratings/entities/rating.entity';
import { User } from '@app/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'series' })
export class Series {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  year: number;

  @Column()
  description: string;

  @ManyToOne(() => Rating)
  @JoinColumn({ name: 'rating_id', referencedColumnName: 'id' })
  rating: Rating;

  @Column()
  recommendScore: number;

  @Column()
  avgReviewScore: number;

  @Column()
  reviewCount: number;

  @ManyToOne(() => User, (user) => user.seriesCreated, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  createdBy: User;

  @Column()
  createdById: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
