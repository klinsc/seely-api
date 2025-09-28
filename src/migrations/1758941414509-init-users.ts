import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsers1758941414509 implements MigrationInterface {
  // // user.entity.ts
  // import { Series } from '@app/series/entities/series.entity';
  // import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

  // export enum Role {
  //   USER = 'USER',
  //   ADMIN = 'ADMIN',
  // }

  // @Entity('users')
  // export class User {
  //   @PrimaryGeneratedColumn()
  //   id: number;

  //   @Column({
  //     unique: true,
  //     nullable: false,
  //   })
  //   username: string;

  //   @Column({
  //     nullable: true,
  //   })
  //   password: string;

  //   @Column({
  //     nullable: false,
  //     default: Role.USER,
  //   })
  //   role: Role;

  //   @Column({ name: 'keycloak_id', unique: true, nullable: true })
  //   keycloakId: string;

  //   @OneToMany(() => Series, (series) => series.createdBy)
  //   series: Series[];
  // }

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
