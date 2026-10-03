import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_fixtures_result_method" ADD VALUE 'walkover' BEFORE 'no-result';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fixtures" ALTER COLUMN "result_method" SET DATA TYPE text;
  ALTER TABLE "fixtures" ALTER COLUMN "result_method" SET DEFAULT 'normal'::text;
  DROP TYPE "public"."enum_fixtures_result_method";
  CREATE TYPE "public"."enum_fixtures_result_method" AS ENUM('normal', 'dls', 'forfeit', 'no-result');
  ALTER TABLE "fixtures" ALTER COLUMN "result_method" SET DEFAULT 'normal'::"public"."enum_fixtures_result_method";
  ALTER TABLE "fixtures" ALTER COLUMN "result_method" SET DATA TYPE "public"."enum_fixtures_result_method" USING "result_method"::"public"."enum_fixtures_result_method";`)
}
