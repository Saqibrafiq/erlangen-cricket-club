import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_players_playing_role" AS ENUM('batter', 'bowler', 'all-rounder', 'wicketkeeper');
  CREATE TYPE "public"."enum_players_batting_style" AS ENUM('right-hand', 'left-hand');
  CREATE TYPE "public"."enum_players_bowling_style" AS ENUM('right-arm-fast', 'right-arm-medium', 'right-arm-off-spin', 'right-arm-leg-spin', 'left-arm-fast', 'left-arm-medium', 'left-arm-orthodox', 'left-arm-wrist-spin');
  CREATE TYPE "public"."enum_players_club_office" AS ENUM('president', 'vice-president', 'treasurer', 'secretary');
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"playing_role" "enum_players_playing_role",
  	"batting_style" "enum_players_batting_style",
  	"bowling_style" "enum_players_bowling_style",
  	"club_office" "enum_players_club_office",
  	"slug" varchar NOT NULL,
  	"has_publish_consent" boolean DEFAULT false,
  	"consent_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "players_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"teams_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "players_id" integer;
  ALTER TABLE "players" ADD CONSTRAINT "players_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_locales" ADD CONSTRAINT "players_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "players_photo_idx" ON "players" USING btree ("photo_id");
  CREATE UNIQUE INDEX "players_slug_idx" ON "players" USING btree ("slug");
  CREATE INDEX "players_has_publish_consent_idx" ON "players" USING btree ("has_publish_consent");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE UNIQUE INDEX "players_locales_locale_parent_id_unique" ON "players_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "players_rels_order_idx" ON "players_rels" USING btree ("order");
  CREATE INDEX "players_rels_parent_idx" ON "players_rels" USING btree ("parent_id");
  CREATE INDEX "players_rels_path_idx" ON "players_rels" USING btree ("path");
  CREATE INDEX "players_rels_teams_id_idx" ON "players_rels" USING btree ("teams_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "players" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "players_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "players_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "players" CASCADE;
  DROP TABLE "players_locales" CASCADE;
  DROP TABLE "players_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_players_fk";
  
  DROP INDEX "payload_locked_documents_rels_players_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "players_id";
  DROP TYPE "public"."enum_players_playing_role";
  DROP TYPE "public"."enum_players_batting_style";
  DROP TYPE "public"."enum_players_bowling_style";
  DROP TYPE "public"."enum_players_club_office";`)
}
