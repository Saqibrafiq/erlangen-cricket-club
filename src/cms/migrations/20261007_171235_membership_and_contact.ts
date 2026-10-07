import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_messages_topic" AS ENUM('membership', 'sponsorship', 'matches', 'other');
  CREATE TYPE "public"."enum_contact_messages_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'replied', 'closed');
  CREATE TYPE "public"."enum_membership_sessions_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TABLE "documents" (
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
  
  CREATE TABLE "documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"topic" "enum_contact_messages_topic" NOT NULL,
  	"message" varchar NOT NULL,
  	"locale" "enum_contact_messages_locale" NOT NULL,
  	"status" "enum_contact_messages_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_fees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"annual_fee" numeric NOT NULL,
  	"reduced_fee" numeric,
  	"per_match_fee" numeric,
  	"is_highlighted" boolean DEFAULT false
  );
  
  CREATE TABLE "membership_fees_locales" (
  	"name" varchar NOT NULL,
  	"includes" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "membership_sessions_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_membership_sessions_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "membership_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL
  );
  
  CREATE TABLE "membership_sessions_locales" (
  	"title" varchar NOT NULL,
  	"venue" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "membership" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"application_form_id" integer,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "membership_locales" (
  	"fees_note" varchar,
  	"terms" varchar,
  	"sessions_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"facebook_url" varchar,
  	"instagram_url" varchar,
  	"ground_street" varchar NOT NULL,
  	"ground_postal_code" varchar NOT NULL,
  	"ground_city" varchar NOT NULL,
  	"ground_latitude" numeric NOT NULL,
  	"ground_longitude" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_locales" (
  	"ground_name" varchar NOT NULL,
  	"ground_directions" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_messages_id" integer;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership_fees_locales" ADD CONSTRAINT "membership_fees_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership_fees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership_sessions_days" ADD CONSTRAINT "membership_sessions_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."membership_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership_sessions" ADD CONSTRAINT "membership_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership_sessions_locales" ADD CONSTRAINT "membership_sessions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membership" ADD CONSTRAINT "membership_application_form_id_documents_id_fk" FOREIGN KEY ("application_form_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership" ADD CONSTRAINT "membership_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_locales" ADD CONSTRAINT "membership_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "membership_fees_order_idx" ON "membership_fees" USING btree ("_order");
  CREATE INDEX "membership_fees_parent_id_idx" ON "membership_fees" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "membership_fees_locales_locale_parent_id_unique" ON "membership_fees_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "membership_sessions_days_order_idx" ON "membership_sessions_days" USING btree ("order");
  CREATE INDEX "membership_sessions_days_parent_idx" ON "membership_sessions_days" USING btree ("parent_id");
  CREATE INDEX "membership_sessions_order_idx" ON "membership_sessions" USING btree ("_order");
  CREATE INDEX "membership_sessions_parent_id_idx" ON "membership_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "membership_sessions_locales_locale_parent_id_unique" ON "membership_sessions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "membership_application_form_idx" ON "membership" USING btree ("application_form_id");
  CREATE INDEX "membership_hero_image_idx" ON "membership" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "membership_locales_locale_parent_id_unique" ON "membership_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_locales_locale_parent_id_unique" ON "contact_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_fees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_fees_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_sessions_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_sessions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "membership_fees" CASCADE;
  DROP TABLE "membership_fees_locales" CASCADE;
  DROP TABLE "membership_sessions_days" CASCADE;
  DROP TABLE "membership_sessions" CASCADE;
  DROP TABLE "membership_sessions_locales" CASCADE;
  DROP TABLE "membership" CASCADE;
  DROP TABLE "membership_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "contact_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_contact_messages_fk";
  
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_messages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_messages_id";
  DROP TYPE "public"."enum_contact_messages_topic";
  DROP TYPE "public"."enum_contact_messages_locale";
  DROP TYPE "public"."enum_contact_messages_status";
  DROP TYPE "public"."enum_membership_sessions_days";`)
}
