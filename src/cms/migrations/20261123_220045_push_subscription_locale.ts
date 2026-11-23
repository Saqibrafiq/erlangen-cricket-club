import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_push_subscriptions_locale" AS ENUM('en', 'de');
  ALTER TABLE "push_subscriptions" ADD COLUMN "locale" "enum_push_subscriptions_locale" DEFAULT 'en' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "push_subscriptions" DROP COLUMN "locale";
  DROP TYPE "public"."enum_push_subscriptions_locale";`)
}
