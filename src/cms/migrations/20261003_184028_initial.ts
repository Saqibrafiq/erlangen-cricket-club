import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_fixtures_stage" AS ENUM('league', 'qualifier', 'semi-final', 'final');
  CREATE TYPE "public"."enum_fixtures_status" AS ENUM('scheduled', 'completed', 'abandoned', 'cancelled');
  CREATE TYPE "public"."enum_fixtures_result_method" AS ENUM('normal', 'dls', 'forfeit', 'no-result');
  CREATE TYPE "public"."enum_fixtures_result_margin_unit" AS ENUM('runs', 'wickets');
  CREATE TABLE "fixtures_innings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"batting_team_id" integer,
  	"runs" numeric,
  	"wickets" numeric,
  	"overs" varchar,
  	"max_overs" numeric
  );
  
  CREATE TABLE "fixtures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"competition_id" integer NOT NULL,
  	"stage" "enum_fixtures_stage" DEFAULT 'league' NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar,
  	"venue" varchar,
  	"team1_id" integer NOT NULL,
  	"team2_id" integer NOT NULL,
  	"status" "enum_fixtures_status" DEFAULT 'scheduled' NOT NULL,
  	"result_method" "enum_fixtures_result_method" DEFAULT 'normal',
  	"result_winner_id" integer,
  	"result_margin_value" numeric,
  	"result_margin_unit" "enum_fixtures_result_margin_unit",
  	"import_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"short_name" varchar NOT NULL,
  	"is_club_team" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "competitions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"season" varchar NOT NULL,
  	"max_overs" numeric DEFAULT 20 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"fixtures_id" integer,
  	"teams_id" integer,
  	"competitions_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "fixtures_innings" ADD CONSTRAINT "fixtures_innings_batting_team_id_teams_id_fk" FOREIGN KEY ("batting_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fixtures_innings" ADD CONSTRAINT "fixtures_innings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_result_winner_id_teams_id_fk" FOREIGN KEY ("result_winner_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fixtures_fk" FOREIGN KEY ("fixtures_id") REFERENCES "public"."fixtures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_competitions_fk" FOREIGN KEY ("competitions_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "fixtures_innings_order_idx" ON "fixtures_innings" USING btree ("_order");
  CREATE INDEX "fixtures_innings_parent_id_idx" ON "fixtures_innings" USING btree ("_parent_id");
  CREATE INDEX "fixtures_innings_batting_team_idx" ON "fixtures_innings" USING btree ("batting_team_id");
  CREATE INDEX "fixtures_competition_idx" ON "fixtures" USING btree ("competition_id");
  CREATE INDEX "fixtures_date_idx" ON "fixtures" USING btree ("date");
  CREATE INDEX "fixtures_team1_idx" ON "fixtures" USING btree ("team1_id");
  CREATE INDEX "fixtures_team2_idx" ON "fixtures" USING btree ("team2_id");
  CREATE INDEX "fixtures_status_idx" ON "fixtures" USING btree ("status");
  CREATE INDEX "fixtures_result_result_winner_idx" ON "fixtures" USING btree ("result_winner_id");
  CREATE UNIQUE INDEX "fixtures_import_key_idx" ON "fixtures" USING btree ("import_key");
  CREATE INDEX "fixtures_updated_at_idx" ON "fixtures" USING btree ("updated_at");
  CREATE INDEX "fixtures_created_at_idx" ON "fixtures" USING btree ("created_at");
  CREATE UNIQUE INDEX "teams_short_name_idx" ON "teams" USING btree ("short_name");
  CREATE INDEX "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX "competitions_season_idx" ON "competitions" USING btree ("season");
  CREATE INDEX "competitions_updated_at_idx" ON "competitions" USING btree ("updated_at");
  CREATE INDEX "competitions_created_at_idx" ON "competitions" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_fixtures_id_idx" ON "payload_locked_documents_rels" USING btree ("fixtures_id");
  CREATE INDEX "payload_locked_documents_rels_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("teams_id");
  CREATE INDEX "payload_locked_documents_rels_competitions_id_idx" ON "payload_locked_documents_rels" USING btree ("competitions_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "fixtures_innings" CASCADE;
  DROP TABLE "fixtures" CASCADE;
  DROP TABLE "teams" CASCADE;
  DROP TABLE "competitions" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_fixtures_stage";
  DROP TYPE "public"."enum_fixtures_status";
  DROP TYPE "public"."enum_fixtures_result_method";
  DROP TYPE "public"."enum_fixtures_result_margin_unit";`)
}
