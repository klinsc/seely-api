import { MigrationInterface, QueryRunner } from 'typeorm';
import bcrypt from 'bcrypt';

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

    // Add default users
    const users = [
      { username: 'u111', password: 'u111', role: 'USER' },
      { username: 'u112', password: 'u112', role: 'USER' },
      { username: 'u115', password: 'u115', role: 'USER' },
      { username: 'u116', password: 'u116', role: 'USER' },
      { username: 'u118', password: 'u118', role: 'USER' },
      { username: 'u119', password: 'u119', role: 'USER' },

      { username: 'manager', password: 'password', role: 'MANAGER' },
    ];

    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedUsers = users.map(async (user) => ({
      ...user,
      password: user.password ? await bcrypt.hash(user.password, 10) : null,
    }));

    const resolvedUsers = await Promise.all(hashedUsers);

    for (const user of resolvedUsers) {
      await queryRunner.query(
        `
        INSERT INTO "users" (username, password, role)
        VALUES ($1, $2, $3)
      `,
        [user.username, user.password, user.role],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
