// user.entity.ts
import { Review } from '@app/reviews/entities/review.entity';
import { Series } from '@app/series/entities/series.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: false,
    default: Role.USER,
  })
  role: Role;

  @Column({ name: 'keycloak_id', unique: true, nullable: true })
  keycloakId: string;

  @OneToMany(() => Series, (series) => series.createdBy)
  series: Series[];

  @OneToMany(() => Review, (review) => review.createdBy)
  reviews: Review[];
}
