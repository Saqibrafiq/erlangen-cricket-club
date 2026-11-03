import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Moves free-text venues into saved grounds, linking each fixture, before the column goes. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   INSERT INTO "grounds" ("name")
     SELECT DISTINCT trim("venue") FROM "fixtures"
     WHERE "venue" IS NOT NULL AND trim("venue") <> ''
     ON CONFLICT ("name") DO NOTHING;
   UPDATE "fixtures" AS f SET "ground_id" = g."id"
     FROM "grounds" AS g
     WHERE f."ground_id" IS NULL AND g."name" = trim(f."venue");
   ALTER TABLE "fixtures" DROP COLUMN "venue";`)
}

/** Restores the column from the linked grounds' names. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fixtures" ADD COLUMN "venue" varchar;
   UPDATE "fixtures" AS f SET "venue" = g."name"
     FROM "grounds" AS g
     WHERE g."id" = f."ground_id";`)
}
