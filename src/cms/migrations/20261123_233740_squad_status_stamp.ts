import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "squads" ADD COLUMN "status_changed_at" timestamp(3) with time zone;
  UPDATE "squads" SET "status_changed_at" = "updated_at";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "squads" DROP COLUMN "status_changed_at";`)
}
