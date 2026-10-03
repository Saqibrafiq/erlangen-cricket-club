import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "impressum" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impressum_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "privacy_policy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "privacy_policy_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "impressum_locales" ADD CONSTRAINT "impressum_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impressum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_policy_locales" ADD CONSTRAINT "privacy_policy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy_policy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "impressum_locales_locale_parent_id_unique" ON "impressum_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "privacy_policy_locales_locale_parent_id_unique" ON "privacy_policy_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "impressum" CASCADE;
  DROP TABLE "impressum_locales" CASCADE;
  DROP TABLE "privacy_policy" CASCADE;
  DROP TABLE "privacy_policy_locales" CASCADE;`)
}
