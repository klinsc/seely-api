// difficulty.entity.ts
import { Series } from '@app/series/entities/series.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Series, (series) => series.rating)
  series: Series[];
}
