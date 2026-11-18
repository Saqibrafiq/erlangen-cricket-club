import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "spielerpass_cards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_objectkey" varchar,
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
  
  CREATE TABLE "match_sheets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fixture_id" integer NOT NULL,
  	"team_id" integer NOT NULL,
  	"_objectkey" varchar,
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
  
  CREATE TABLE "stored_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"mime_type" varchar NOT NULL,
  	"filesize" numeric NOT NULL,
  	"data" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "spielerpasses" ADD COLUMN "card_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "spielerpass_cards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "match_sheets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stored_files_id" integer;
  ALTER TABLE "match_sheets" ADD CONSTRAINT "match_sheets_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "match_sheets" ADD CONSTRAINT "match_sheets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "spielerpass_cards_updated_at_idx" ON "spielerpass_cards" USING btree ("updated_at");
  CREATE INDEX "spielerpass_cards_created_at_idx" ON "spielerpass_cards" USING btree ("created_at");
  CREATE UNIQUE INDEX "spielerpass_cards_filename_idx" ON "spielerpass_cards" USING btree ("filename");
  CREATE UNIQUE INDEX "match_sheets_fixture_idx" ON "match_sheets" USING btree ("fixture_id");
  CREATE INDEX "match_sheets_team_idx" ON "match_sheets" USING btree ("team_id");
  CREATE INDEX "match_sheets_updated_at_idx" ON "match_sheets" USING btree ("updated_at");
  CREATE INDEX "match_sheets_created_at_idx" ON "match_sheets" USING btree ("created_at");
  CREATE UNIQUE INDEX "match_sheets_filename_idx" ON "match_sheets" USING btree ("filename");
  CREATE UNIQUE INDEX "stored_files_key_idx" ON "stored_files" USING btree ("key");
  CREATE INDEX "stored_files_updated_at_idx" ON "stored_files" USING btree ("updated_at");
  CREATE INDEX "stored_files_created_at_idx" ON "stored_files" USING btree ("created_at");
  ALTER TABLE "spielerpasses" ADD CONSTRAINT "spielerpasses_card_id_spielerpass_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."spielerpass_cards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spielerpass_cards_fk" FOREIGN KEY ("spielerpass_cards_id") REFERENCES "public"."spielerpass_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_match_sheets_fk" FOREIGN KEY ("match_sheets_id") REFERENCES "public"."match_sheets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stored_files_fk" FOREIGN KEY ("stored_files_id") REFERENCES "public"."stored_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "spielerpasses_card_idx" ON "spielerpasses" USING btree ("card_id");
  CREATE INDEX "payload_locked_documents_rels_spielerpass_cards_id_idx" ON "payload_locked_documents_rels" USING btree ("spielerpass_cards_id");
  CREATE INDEX "payload_locked_documents_rels_match_sheets_id_idx" ON "payload_locked_documents_rels" USING btree ("match_sheets_id");
  CREATE INDEX "payload_locked_documents_rels_stored_files_id_idx" ON "payload_locked_documents_rels" USING btree ("stored_files_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "spielerpass_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "match_sheets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stored_files" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "spielerpass_cards" CASCADE;
  DROP TABLE "match_sheets" CASCADE;
  DROP TABLE "stored_files" CASCADE;
  ALTER TABLE "spielerpasses" DROP CONSTRAINT "spielerpasses_card_id_spielerpass_cards_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_spielerpass_cards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_match_sheets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stored_files_fk";
  
  DROP INDEX "spielerpasses_card_idx";
  DROP INDEX "payload_locked_documents_rels_spielerpass_cards_id_idx";
  DROP INDEX "payload_locked_documents_rels_match_sheets_id_idx";
  DROP INDEX "payload_locked_documents_rels_stored_files_id_idx";
  ALTER TABLE "spielerpasses" DROP COLUMN "card_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "spielerpass_cards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "match_sheets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stored_files_id";`)
}
