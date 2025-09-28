import { MigrationInterface, QueryRunner } from 'typeorm';
// import bcrypt from 'bcrypt';

export class InitUsers1758941414509 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying,
        "role" character varying NOT NULL DEFAULT 'USER',
        "keycloak_id" character varying,
        CONSTRAINT "UQ_username" UNIQUE ("username"),
        CONSTRAINT "UQ_keycloak_id" UNIQUE ("keycloak_id"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // TODO: Add default users

    // const users =[
    //   { username: 'user', password: 'password', role: 'USER' },
    //   { username: 'manager', password: 'password', role: 'MANAGER' },
    // ]
    // const hashedPassword = await bcrypt.hash(.password, 10);

    // // Add ADMIN user
    // await queryRunner.query(`
    //   INSERT INTO "users" (username, password, role)
    //   VALUES ('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ADMIN')
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
