import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitReviews1759025624836 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //  @PrimaryGeneratedColumn()
    //   id: number;
    //   @ManyToOne(() => User)
    //   @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    //   createdBy: User;
    //   @ManyToOne(() => Series)
    //   @JoinColumn({ name: 'series_id', referencedColumnName: 'id' })
    //   forSeries: Series;
    //   @Column()
    //   score: number;
    //   @Column({ nullable: true })
    //   comment: string;
    //   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    //   createdAt: Date;
    //   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    //   updatedAt: Date;
    //   @Column({ type: 'timestamp', nullable: true })
    //   deletedAt: Date | null;

    await queryRunner.query(`
      CREATE TABLE "reviews" (
        id SERIAL PRIMARY KEY,
        created_by_id INTEGER REFERENCES "users"(id),
        series_id INTEGER REFERENCES "series"(id),
        score INTEGER NOT NULL,
        comment TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP
      );
    `);

    // Get all series IDs
    const series = (await queryRunner.query(`SELECT id FROM "series"`)) as {
      id: number;
    }[];
    // If there are no series, skip the rest of the migration
    if (series.length === 0) {
      console.log('No series found. Skipping review creation.');
      return;
    }

    // Insert 3 reviews for each series
    for (const s of series) {
      for (let i = 1; i <= 3; i++) {
        await queryRunner.query(
          `
            INSERT INTO "reviews" (created_by_id, series_id, score, comment, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
          `,
          [
            // Assign reviews to user IDs 1, 2, and 3 in a round-robin fashion
            ((i - 1) % 3) + 1,
            s.id,
            Math.floor(Math.random() * 10) + 1, // Random score between 1 and 10
            `This is review ${i} for series ID ${s.id}`,
          ],
        );
      }
    }

    // Propogate avgReviewScore and reviewCount to series table
    await queryRunner.query(`
      UPDATE "series" s
      SET 
        "avgReviewScore" = sub.avg_score,
        "reviewCount" = sub.review_count
      FROM (
        SELECT 
          r.series_id,
          AVG(r.score) AS avg_score,
          COUNT(r.id) AS review_count
        FROM "reviews" r
        GROUP BY r.series_id
      ) AS sub
      WHERE s.id = sub.series_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
  }
}
