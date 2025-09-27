import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitRatings1758940782619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table if not exists ratings (
            id serial primary key,
            name varchar(255) not null,
            description text not null
        )
    `);

    await queryRunner.query(`
      insert into ratings (name,description) values
      ('ส ส่งเสริม','ภาพยนตร์ที่ส่งเสริมการเรียนรู้และควรส่งเสริมให้มีการดู'),
      ('ท ทั่วไป','ภาพยนตร์ที่เหมาะสมกับผู้ดูทั่วไป'),
      ('น 13+','ภาพยนตร์ที่เหมาะสมกับผู้มีอายุตั้งแต่ 13 ปี ขึ้นไป'),
      ('น 15+','ภาพยนตร์ที่เหมาะสมกับผู้มีอายุตั้งแต่ 15 ปี ขึ้นไป'),
      ('น 18+','ภาพยนตร์ที่เหมาะสมกับผู้มีอายุตั้งแต่ 18 ปี ขึ้นไป'),
      ('ฉ 20+','ภาพยนตร์เรื่องนี้ ห้ามผู้มีอายุต่ำกว่า 20 ปี ดู (ตรวจบัตรประชาชน)')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`
    //   delete from ratings where name in ('ส ส่งเสริม','ท ทั่วไป','น 13+','น 15+','น 18+','ฉ 20+')
    // `);

    await queryRunner.query(`
      drop table if exists ratings
    `);
  }
}
