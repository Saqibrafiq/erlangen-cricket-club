import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "grounds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "fixtures" ADD COLUMN "ground_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "grounds_id" integer;
  CREATE UNIQUE INDEX "grounds_name_idx" ON "grounds" USING btree ("name");
  CREATE INDEX "grounds_updated_at_idx" ON "grounds" USING btree ("updated_at");
  CREATE INDEX "grounds_created_at_idx" ON "grounds" USING btree ("created_at");
  ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_ground_id_grounds_id_fk" FOREIGN KEY ("ground_id") REFERENCES "public"."grounds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_grounds_fk" FOREIGN KEY ("grounds_id") REFERENCES "public"."grounds"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "fixtures_ground_idx" ON "fixtures" USING btree ("ground_id");
  CREATE INDEX "payload_locked_documents_rels_grounds_id_idx" ON "payload_locked_documents_rels" USING btree ("grounds_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "grounds" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "grounds" CASCADE;
  ALTER TABLE "fixtures" DROP CONSTRAINT "fixtures_ground_id_grounds_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_grounds_fk";
  
  DROP INDEX "fixtures_ground_idx";
  DROP INDEX "payload_locked_documents_rels_grounds_id_idx";
  ALTER TABLE "fixtures" DROP COLUMN "ground_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "grounds_id";`)
}
