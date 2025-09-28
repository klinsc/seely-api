import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSeries1758941485698 implements MigrationInterface {
  // import { Rating } from '@app/ratings/entities/rating.entity';
  // import { User } from '@app/users/entities/user.entity';
  // import {
  //   Column,
  //   Entity,
  //   JoinColumn,
  //   ManyToOne,
  //   PrimaryGeneratedColumn,
  // } from 'typeorm';

  // @Entity({ name: 'series' })
  // export class Series {
  //   @PrimaryGeneratedColumn()
  //   id: number;

  //   @Column()
  //   title: string;

  //   @Column()
  //   year: number;

  //   @Column()
  //   description: string;

  //   @ManyToOne(() => Rating)
  //   @JoinColumn({ name: 'rating_id', referencedColumnName: 'id' })
  //   rating: Rating;

  //   @Column()
  //   recommendScore: number;

  //   @Column()
  //   avgReviewScore: number;

  //   @Column()
  //   reviewCount: number;

  //   @ManyToOne(() => User)
  //   @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
  //   createdBy: User;

  //   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  //   createdAt: Date;

  //   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  //   updatedAt: Date;

  //   @Column({ type: 'timestamp', nullable: true })
  //   deletedAt: Date | null;
  // }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "series" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "year" integer NOT NULL,
        "description" character varying NOT NULL,
        "rating_id" integer,
        "recommendScore" integer NOT NULL,
        "avgReviewScore" integer NOT NULL,
        "reviewCount" integer NOT NULL,
        "created_by_id" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_series_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_series_rating" FOREIGN KEY ("rating_id") REFERENCES "ratings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_series_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Insert 20 sample series
    await queryRunner.query(`
      INSERT INTO "series" ("title", "year", "description", "rating_id", "recommendScore", "avgReviewScore", "reviewCount", "created_by_id")
      VALUES 
        ('Breaking Bad', 2008, 'A high school chemistry teacher turned methamphetamine producer.', 1, 95, 9, 1500, 1),
        ('Stranger Things', 2016, 'A group of kids uncover supernatural mysteries in their small town.', 2, 90, 8, 1200, 2),
        ('Game of Thrones', 2011, 'Noble families vie for control of the Iron Throne in a fantasy world.', 3, 85, 7, 2000, 3),
        ('The Crown', 2016, 'The reign of Queen Elizabeth II and the British royal family.', 4, 80, 8, 800, 4),
        ('The Mandalorian', 2019, 'A lone bounty hunter in the outer reaches of the galaxy.', 5, 88, 9, 1100, 5),
        ('Friends', 1994, 'Six friends navigate life and love in New York City.', 1, 92, 8, 2500, 6),
        ('The Office', 2005, 'A mockumentary on a group of typical office workers.', 2, 89, 9, 2300, 7),
        ('Sherlock', 2010, 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.', 3, 87, 8, 900, 1),
        ('Westworld', 2016, 'A dark odyssey about the dawn of artificial consciousness and the evolution of sin.', 4, 84, 7, 700, 2),
        ('The Witcher', 2019, 'A monster hunter struggles to find his place in a world where people often prove more wicked than beasts.', 5, 86, 8, 950, 3),
        ('Black Mirror', 2011, 'An anthology series exploring a twisted, high-tech multiverse where humanity''s greatest innovations and darkest instincts collide.', 1, 91, 9, 1300, 4),
        ('Narcos', 2015, 'The rise of the cocaine trade in Colombia and the gripping real-life stories of drug kingpins.', 2, 83, 8, 600, 5),
        ('House of Cards', 2013, 'A ruthless politician will stop at nothing to conquer Washington, D.C.', 3, 82, 7, 500, 6),
        ('Ozark', 2017, 'A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder money to appease a drug boss.', 4, 85, 8, 750, 7),
        ('Better Call Saul', 2015, 'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.', 5, 94, 9, 1400, 1),
        ('The Simpsons', 1989, 'The satirical adventures of a working-class family in the misfit city of Springfield.', 1, 90, 8, 3000, 2),
        ('Rick and Morty', 2013, 'An animated series that follows the exploits of a super scientist and his not-so-bright grandson.', 2, 88, 9, 1600, 3),
        ('Peaky Blinders', 2013, 'A notorious gang in 1919 England is led by the ambitious and dangerous Tommy Shelby.', 3, 93, 9, 1150, 4),
        ('Mindhunter', 2017, 'In the late 1970s, two FBI agents expand criminal science by delving into the psychology of murder and getting disturbingly close to real-life monsters.', 4, 87, 8, 720, 5),
        ('Succession', 2018, 'The wealthy but dysfunctional Roy family deals with the drama surrounding the health of the family patriarch and their control of a global media and entertainment conglomerate.', 5, 96, 9, 1350, 6);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "series"`);
  }
}
