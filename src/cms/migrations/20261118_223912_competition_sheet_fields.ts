import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "competitions" ADD COLUMN "championship" varchar;
  ALTER TABLE "competitions" ADD COLUMN "division" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "competitions" DROP COLUMN "championship";
  ALTER TABLE "competitions" DROP COLUMN "division";`)
}
