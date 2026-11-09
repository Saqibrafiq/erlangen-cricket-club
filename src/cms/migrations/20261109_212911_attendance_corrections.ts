import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_attendance_corrections_status" AS ENUM('requested', 'accepted', 'declined');
  CREATE TABLE "attendance_corrections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"practice_id" integer NOT NULL,
  	"player_id" integer NOT NULL,
  	"note" varchar,
  	"status" "enum_attendance_corrections_status" DEFAULT 'requested' NOT NULL,
  	"decided_by_id" integer,
  	"team_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "attendance_corrections_id" integer;
  ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_practice_id_practice_sessions_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_decided_by_id_users_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "attendance_corrections_practice_idx" ON "attendance_corrections" USING btree ("practice_id");
  CREATE INDEX "attendance_corrections_player_idx" ON "attendance_corrections" USING btree ("player_id");
  CREATE INDEX "attendance_corrections_decided_by_idx" ON "attendance_corrections" USING btree ("decided_by_id");
  CREATE INDEX "attendance_corrections_team_idx" ON "attendance_corrections" USING btree ("team_id");
  CREATE INDEX "attendance_corrections_updated_at_idx" ON "attendance_corrections" USING btree ("updated_at");
  CREATE INDEX "attendance_corrections_created_at_idx" ON "attendance_corrections" USING btree ("created_at");
  CREATE UNIQUE INDEX "practice_player_1_idx" ON "attendance_corrections" USING btree ("practice_id","player_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attendance_corrections_fk" FOREIGN KEY ("attendance_corrections_id") REFERENCES "public"."attendance_corrections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_attendance_corrections_id_idx" ON "payload_locked_documents_rels" USING btree ("attendance_corrections_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "attendance_corrections" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "attendance_corrections" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_attendance_corrections_fk";
  
  DROP INDEX "payload_locked_documents_rels_attendance_corrections_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "attendance_corrections_id";
  DROP TYPE "public"."enum_attendance_corrections_status";`)
}
