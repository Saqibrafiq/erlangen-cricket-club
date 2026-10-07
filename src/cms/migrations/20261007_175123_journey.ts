import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "journey_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "journey_chapters_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "journey_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "journey_milestones_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "journey" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "journey_chapters" ADD CONSTRAINT "journey_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journey"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journey_chapters_locales" ADD CONSTRAINT "journey_chapters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journey_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journey_milestones" ADD CONSTRAINT "journey_milestones_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journey_milestones" ADD CONSTRAINT "journey_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journey"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journey_milestones_locales" ADD CONSTRAINT "journey_milestones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journey_milestones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "journey_chapters_order_idx" ON "journey_chapters" USING btree ("_order");
  CREATE INDEX "journey_chapters_parent_id_idx" ON "journey_chapters" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "journey_chapters_locales_locale_parent_id_unique" ON "journey_chapters_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "journey_milestones_order_idx" ON "journey_milestones" USING btree ("_order");
  CREATE INDEX "journey_milestones_parent_id_idx" ON "journey_milestones" USING btree ("_parent_id");
  CREATE INDEX "journey_milestones_image_idx" ON "journey_milestones" USING btree ("image_id");
  CREATE UNIQUE INDEX "journey_milestones_locales_locale_parent_id_unique" ON "journey_milestones_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "journey_chapters" CASCADE;
  DROP TABLE "journey_chapters_locales" CASCADE;
  DROP TABLE "journey_milestones" CASCADE;
  DROP TABLE "journey_milestones_locales" CASCADE;
  DROP TABLE "journey" CASCADE;`)
}
