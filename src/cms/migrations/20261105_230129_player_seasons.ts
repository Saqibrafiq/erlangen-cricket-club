import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_player_seasons_competition" AS ENUM('club', 'district');
  CREATE TYPE "public"."enum_player_seasons_format" AS ENUM('all', 't20', 'fifty-over', 'league');
  CREATE TABLE "player_seasons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"player_id" integer NOT NULL,
  	"season" numeric NOT NULL,
  	"competition" "enum_player_seasons_competition" DEFAULT 'club' NOT NULL,
  	"format" "enum_player_seasons_format" DEFAULT 'all' NOT NULL,
  	"team_id" integer,
  	"batting_matches" numeric,
  	"batting_innings" numeric,
  	"batting_not_outs" numeric,
  	"batting_runs" numeric,
  	"batting_balls" numeric,
  	"batting_highest_score" numeric,
  	"batting_is_highest_score_not_out" boolean DEFAULT false,
  	"batting_hundreds" numeric,
  	"batting_fifties" numeric,
  	"batting_fours" numeric,
  	"batting_sixes" numeric,
  	"bowling_matches" numeric,
  	"bowling_innings" numeric,
  	"bowling_overs" varchar,
  	"bowling_maidens" numeric,
  	"bowling_runs_conceded" numeric,
  	"bowling_wickets" numeric,
  	"bowling_best_wickets" numeric,
  	"bowling_best_runs" numeric,
  	"bowling_dot_balls" numeric,
  	"bowling_four_wicket_hauls" numeric,
  	"bowling_five_wicket_hauls" numeric,
  	"bowling_hat_tricks" numeric,
  	"bowling_wides" numeric,
  	"bowling_no_balls" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "player_seasons_id" integer;
  ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "player_seasons_player_idx" ON "player_seasons" USING btree ("player_id");
  CREATE INDEX "player_seasons_team_idx" ON "player_seasons" USING btree ("team_id");
  CREATE INDEX "player_seasons_updated_at_idx" ON "player_seasons" USING btree ("updated_at");
  CREATE INDEX "player_seasons_created_at_idx" ON "player_seasons" USING btree ("created_at");
  CREATE UNIQUE INDEX "player_season_competition_format_team_idx" ON "player_seasons" USING btree ("player_id","season","competition","format","team_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_player_seasons_fk" FOREIGN KEY ("player_seasons_id") REFERENCES "public"."player_seasons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_player_seasons_id_idx" ON "payload_locked_documents_rels" USING btree ("player_seasons_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "player_seasons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "player_seasons" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_player_seasons_fk";
  
  DROP INDEX "payload_locked_documents_rels_player_seasons_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "player_seasons_id";
  DROP TYPE "public"."enum_player_seasons_competition";
  DROP TYPE "public"."enum_player_seasons_format";`)
}
