import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { slugify } from '../../shared/lib/slugify'

// Hand-edited: the generated "ADD COLUMN ... NOT NULL" fails on databases that already contain
// competitions, so the column is added nullable, backfilled with the app's slugify, then constrained.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "competitions" ADD COLUMN "slug" varchar;`)

  const { rows } = await db.execute<{ id: number; name: string; season: string }>(
    sql`SELECT "id", "name", "season" FROM "competitions";`,
  )

  for (const row of rows) {
    const slug = slugify(`${row.name} ${row.season}`)
    await db.execute(sql`UPDATE "competitions" SET "slug" = ${slug} WHERE "id" = ${row.id};`)
  }

  await db.execute(sql`
  ALTER TABLE "competitions" ALTER COLUMN "slug" SET NOT NULL;
  CREATE UNIQUE INDEX "competitions_slug_idx" ON "competitions" USING btree ("slug");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "competitions_slug_idx";
  ALTER TABLE "competitions" DROP COLUMN "slug";`)
}
