import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('player', 'captain', 'admin');
  CREATE TYPE "public"."enum_availability_responses_response" AS ENUM('going', 'not-going');
  CREATE TYPE "public"."enum_squads_picks_role" AS ENUM('playing', 'twelfth', 'reserve');
  CREATE TYPE "public"."enum_squads_status" AS ENUM('open', 'submitted', 'approved', 'returned');
  CREATE TYPE "public"."enum_squads_deadline_day" AS ENUM('tuesday', 'wednesday', 'thursday');
  CREATE TABLE "practice_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"team_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar DEFAULT '18:30' NOT NULL,
  	"fixture_id" integer,
  	"is_cancelled" boolean DEFAULT false,
  	"is_recorded" boolean DEFAULT false,
  	"is_manual" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "availability_responses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"player_id" integer NOT NULL,
  	"fixture_id" integer,
  	"practice_id" integer,
  	"response" "enum_availability_responses_response" NOT NULL,
  	"reason" varchar,
  	"team_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "attendance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"practice_id" integer NOT NULL,
  	"player_id" integer NOT NULL,
  	"attended" boolean DEFAULT true,
  	"is_walk_in" boolean DEFAULT false,
  	"team_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "squads_picks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer NOT NULL,
  	"role" "enum_squads_picks_role" DEFAULT 'playing' NOT NULL,
  	"is_borrowed" boolean DEFAULT false
  );
  
  CREATE TABLE "squads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fixture_id" integer NOT NULL,
  	"status" "enum_squads_status" DEFAULT 'open' NOT NULL,
  	"deadline_day" "enum_squads_deadline_day" DEFAULT 'tuesday' NOT NULL,
  	"note" varchar,
  	"approved_at" timestamp(3) with time zone,
  	"team_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "squads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  CREATE TABLE "spielerpasses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"player_id" integer NOT NULL,
  	"registered_name" varchar NOT NULL,
  	"pass_number" varchar NOT NULL,
  	"valid_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "push_subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"p256dh" varchar NOT NULL,
  	"auth" varchar NOT NULL,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notification_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"kind" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "players" ADD COLUMN "squad_team_id" integer;
  ALTER TABLE "players" ADD COLUMN "is_ecc1_eligible" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'player' NOT NULL;
  -- Every account so far is a website editor: keep their rights as admins (ADR-0024).
  UPDATE "users" SET "role" = 'admin';
  ALTER TABLE "users" ADD COLUMN "player_id" integer;
  ALTER TABLE "users" ADD COLUMN "captain_of_id" integer;
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "practice_sessions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "availability_responses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "attendance_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "squads_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "spielerpasses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "push_subscriptions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notification_log_id" integer;
  ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "availability_responses" ADD CONSTRAINT "availability_responses_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "availability_responses" ADD CONSTRAINT "availability_responses_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "availability_responses" ADD CONSTRAINT "availability_responses_practice_id_practice_sessions_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "availability_responses" ADD CONSTRAINT "availability_responses_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_practice_id_practice_sessions_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "squads_picks" ADD CONSTRAINT "squads_picks_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "squads_picks" ADD CONSTRAINT "squads_picks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."squads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "squads" ADD CONSTRAINT "squads_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "squads" ADD CONSTRAINT "squads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "squads_rels" ADD CONSTRAINT "squads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."squads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "squads_rels" ADD CONSTRAINT "squads_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spielerpasses" ADD CONSTRAINT "spielerpasses_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "practice_sessions_team_idx" ON "practice_sessions" USING btree ("team_id");
  CREATE INDEX "practice_sessions_fixture_idx" ON "practice_sessions" USING btree ("fixture_id");
  CREATE INDEX "practice_sessions_updated_at_idx" ON "practice_sessions" USING btree ("updated_at");
  CREATE INDEX "practice_sessions_created_at_idx" ON "practice_sessions" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_date_idx" ON "practice_sessions" USING btree ("team_id","date");
  CREATE INDEX "availability_responses_player_idx" ON "availability_responses" USING btree ("player_id");
  CREATE INDEX "availability_responses_fixture_idx" ON "availability_responses" USING btree ("fixture_id");
  CREATE INDEX "availability_responses_practice_idx" ON "availability_responses" USING btree ("practice_id");
  CREATE INDEX "availability_responses_team_idx" ON "availability_responses" USING btree ("team_id");
  CREATE INDEX "availability_responses_updated_at_idx" ON "availability_responses" USING btree ("updated_at");
  CREATE INDEX "availability_responses_created_at_idx" ON "availability_responses" USING btree ("created_at");
  CREATE UNIQUE INDEX "player_fixture_idx" ON "availability_responses" USING btree ("player_id","fixture_id");
  CREATE UNIQUE INDEX "player_practice_idx" ON "availability_responses" USING btree ("player_id","practice_id");
  CREATE INDEX "attendance_practice_idx" ON "attendance" USING btree ("practice_id");
  CREATE INDEX "attendance_player_idx" ON "attendance" USING btree ("player_id");
  CREATE INDEX "attendance_team_idx" ON "attendance" USING btree ("team_id");
  CREATE INDEX "attendance_updated_at_idx" ON "attendance" USING btree ("updated_at");
  CREATE INDEX "attendance_created_at_idx" ON "attendance" USING btree ("created_at");
  CREATE UNIQUE INDEX "practice_player_idx" ON "attendance" USING btree ("practice_id","player_id");
  CREATE INDEX "squads_picks_order_idx" ON "squads_picks" USING btree ("_order");
  CREATE INDEX "squads_picks_parent_id_idx" ON "squads_picks" USING btree ("_parent_id");
  CREATE INDEX "squads_picks_player_idx" ON "squads_picks" USING btree ("player_id");
  CREATE UNIQUE INDEX "squads_fixture_idx" ON "squads" USING btree ("fixture_id");
  CREATE INDEX "squads_team_idx" ON "squads" USING btree ("team_id");
  CREATE INDEX "squads_updated_at_idx" ON "squads" USING btree ("updated_at");
  CREATE INDEX "squads_created_at_idx" ON "squads" USING btree ("created_at");
  CREATE INDEX "squads_rels_order_idx" ON "squads_rels" USING btree ("order");
  CREATE INDEX "squads_rels_parent_idx" ON "squads_rels" USING btree ("parent_id");
  CREATE INDEX "squads_rels_path_idx" ON "squads_rels" USING btree ("path");
  CREATE INDEX "squads_rels_players_id_idx" ON "squads_rels" USING btree ("players_id");
  CREATE UNIQUE INDEX "spielerpasses_player_idx" ON "spielerpasses" USING btree ("player_id");
  CREATE INDEX "spielerpasses_updated_at_idx" ON "spielerpasses" USING btree ("updated_at");
  CREATE INDEX "spielerpasses_created_at_idx" ON "spielerpasses" USING btree ("created_at");
  CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");
  CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");
  CREATE INDEX "push_subscriptions_updated_at_idx" ON "push_subscriptions" USING btree ("updated_at");
  CREATE INDEX "push_subscriptions_created_at_idx" ON "push_subscriptions" USING btree ("created_at");
  CREATE UNIQUE INDEX "notification_log_key_idx" ON "notification_log" USING btree ("key");
  CREATE INDEX "notification_log_user_idx" ON "notification_log" USING btree ("user_id");
  CREATE INDEX "notification_log_updated_at_idx" ON "notification_log" USING btree ("updated_at");
  CREATE INDEX "notification_log_created_at_idx" ON "notification_log" USING btree ("created_at");
  ALTER TABLE "players" ADD CONSTRAINT "players_squad_team_id_teams_id_fk" FOREIGN KEY ("squad_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_captain_of_id_teams_id_fk" FOREIGN KEY ("captain_of_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_practice_sessions_fk" FOREIGN KEY ("practice_sessions_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_availability_responses_fk" FOREIGN KEY ("availability_responses_id") REFERENCES "public"."availability_responses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attendance_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_squads_fk" FOREIGN KEY ("squads_id") REFERENCES "public"."squads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spielerpasses_fk" FOREIGN KEY ("spielerpasses_id") REFERENCES "public"."spielerpasses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_push_subscriptions_fk" FOREIGN KEY ("push_subscriptions_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notification_log_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "players_squad_team_idx" ON "players" USING btree ("squad_team_id");
  CREATE UNIQUE INDEX "users_player_idx" ON "users" USING btree ("player_id");
  CREATE INDEX "users_captain_of_idx" ON "users" USING btree ("captain_of_id");
  CREATE INDEX "payload_locked_documents_rels_practice_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("practice_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_availability_responses_id_idx" ON "payload_locked_documents_rels" USING btree ("availability_responses_id");
  CREATE INDEX "payload_locked_documents_rels_attendance_id_idx" ON "payload_locked_documents_rels" USING btree ("attendance_id");
  CREATE INDEX "payload_locked_documents_rels_squads_id_idx" ON "payload_locked_documents_rels" USING btree ("squads_id");
  CREATE INDEX "payload_locked_documents_rels_spielerpasses_id_idx" ON "payload_locked_documents_rels" USING btree ("spielerpasses_id");
  CREATE INDEX "payload_locked_documents_rels_push_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("push_subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_notification_log_id_idx" ON "payload_locked_documents_rels" USING btree ("notification_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "practice_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "availability_responses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "attendance" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "squads_picks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "squads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "squads_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "spielerpasses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "push_subscriptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notification_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "practice_sessions" CASCADE;
  DROP TABLE "availability_responses" CASCADE;
  DROP TABLE "attendance" CASCADE;
  DROP TABLE "squads_picks" CASCADE;
  DROP TABLE "squads" CASCADE;
  DROP TABLE "squads_rels" CASCADE;
  DROP TABLE "spielerpasses" CASCADE;
  DROP TABLE "push_subscriptions" CASCADE;
  DROP TABLE "notification_log" CASCADE;
  ALTER TABLE "players" DROP CONSTRAINT "players_squad_team_id_teams_id_fk";
  
  ALTER TABLE "users" DROP CONSTRAINT "users_player_id_players_id_fk";
  
  ALTER TABLE "users" DROP CONSTRAINT "users_captain_of_id_teams_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_practice_sessions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_availability_responses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_attendance_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_squads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_spielerpasses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_push_subscriptions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notification_log_fk";
  
  DROP INDEX "players_squad_team_idx";
  DROP INDEX "users_player_idx";
  DROP INDEX "users_captain_of_idx";
  DROP INDEX "payload_locked_documents_rels_practice_sessions_id_idx";
  DROP INDEX "payload_locked_documents_rels_availability_responses_id_idx";
  DROP INDEX "payload_locked_documents_rels_attendance_id_idx";
  DROP INDEX "payload_locked_documents_rels_squads_id_idx";
  DROP INDEX "payload_locked_documents_rels_spielerpasses_id_idx";
  DROP INDEX "payload_locked_documents_rels_push_subscriptions_id_idx";
  DROP INDEX "payload_locked_documents_rels_notification_log_id_idx";
  ALTER TABLE "players" DROP COLUMN "squad_team_id";
  ALTER TABLE "players" DROP COLUMN "is_ecc1_eligible";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "player_id";
  ALTER TABLE "users" DROP COLUMN "captain_of_id";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "practice_sessions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "availability_responses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "attendance_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "squads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "spielerpasses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "push_subscriptions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notification_log_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_availability_responses_response";
  DROP TYPE "public"."enum_squads_picks_role";
  DROP TYPE "public"."enum_squads_status";
  DROP TYPE "public"."enum_squads_deadline_day";`)
}
