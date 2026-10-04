import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "competitions_standings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"team_id" integer NOT NULL,
  	"played" numeric NOT NULL,
  	"won" numeric NOT NULL,
  	"lost" numeric NOT NULL,
  	"no_result" numeric NOT NULL,
  	"tied" numeric NOT NULL,
  	"points" numeric NOT NULL,
  	"win_rate" numeric NOT NULL,
  	"net_run_rate" numeric NOT NULL,
  	"runs_for" numeric NOT NULL,
  	"overs_faced" varchar NOT NULL,
  	"runs_against" numeric NOT NULL,
  	"overs_bowled" varchar NOT NULL
  );
  
  ALTER TABLE "competitions_standings" ADD CONSTRAINT "competitions_standings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "competitions_standings" ADD CONSTRAINT "competitions_standings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "competitions_standings_order_idx" ON "competitions_standings" USING btree ("_order");
  CREATE INDEX "competitions_standings_parent_id_idx" ON "competitions_standings" USING btree ("_parent_id");
  CREATE INDEX "competitions_standings_team_idx" ON "competitions_standings" USING btree ("team_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "competitions_standings" CASCADE;`)
}
