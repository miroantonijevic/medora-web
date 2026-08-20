import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_amenity_groups_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_amenities_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_amenity_groups_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_amenities_id_idx";

    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "amenity_groups_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "amenities_id";

    DROP TABLE IF EXISTS "amenities_rels" CASCADE;
    DROP TABLE IF EXISTS "amenities_highlights" CASCADE;
    DROP TABLE IF EXISTS "amenities_locales" CASCADE;
    DROP TABLE IF EXISTS "amenities" CASCADE;
    DROP TABLE IF EXISTS "amenity_groups_locales" CASCADE;
    DROP TABLE IF EXISTS "amenity_groups" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "amenity_groups" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar NOT NULL,
      "hero_image_id" integer,
      "order" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "amenity_groups_locales" (
      "name" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "amenities" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar NOT NULL,
      "group_id" integer NOT NULL,
      "hero_image_id" integer,
      "order" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "amenities_locales" (
      "name" varchar NOT NULL,
      "tagline" varchar,
      "description" jsonb,
      "opening_hours" varchar,
      "location" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "amenities_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_locale" "_locales" NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );

    CREATE TABLE "amenities_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    ALTER TABLE "amenity_groups" ADD CONSTRAINT "amenity_groups_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "amenity_groups_locales" ADD CONSTRAINT "amenity_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenity_groups"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "amenities" ADD CONSTRAINT "amenities_group_id_amenity_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."amenity_groups"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "amenities" ADD CONSTRAINT "amenities_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "amenities_locales" ADD CONSTRAINT "amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "amenities_highlights" ADD CONSTRAINT "amenities_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "amenity_groups_slug_idx" ON "amenity_groups" USING btree ("slug");
    CREATE INDEX "amenity_groups_hero_image_idx" ON "amenity_groups" USING btree ("hero_image_id");
    CREATE INDEX "amenity_groups_updated_at_idx" ON "amenity_groups" USING btree ("updated_at");
    CREATE INDEX "amenity_groups_created_at_idx" ON "amenity_groups" USING btree ("created_at");
    CREATE UNIQUE INDEX "amenity_groups_locales_locale_parent_id_unique" ON "amenity_groups_locales" USING btree ("_locale","_parent_id");

    CREATE INDEX "amenities_slug_idx" ON "amenities" USING btree ("slug");
    CREATE INDEX "amenities_group_idx" ON "amenities" USING btree ("group_id");
    CREATE INDEX "amenities_hero_image_idx" ON "amenities" USING btree ("hero_image_id");
    CREATE INDEX "amenities_updated_at_idx" ON "amenities" USING btree ("updated_at");
    CREATE INDEX "amenities_created_at_idx" ON "amenities" USING btree ("created_at");
    CREATE UNIQUE INDEX "amenities_locales_locale_parent_id_unique" ON "amenities_locales" USING btree ("_locale","_parent_id");

    CREATE INDEX "amenities_highlights_order_idx" ON "amenities_highlights" USING btree ("_order");
    CREATE INDEX "amenities_highlights_parent_id_idx" ON "amenities_highlights" USING btree ("_parent_id");
    CREATE INDEX "amenities_highlights_locale_idx" ON "amenities_highlights" USING btree ("_locale");

    CREATE INDEX "amenities_rels_order_idx" ON "amenities_rels" USING btree ("order");
    CREATE INDEX "amenities_rels_parent_idx" ON "amenities_rels" USING btree ("parent_id");
    CREATE INDEX "amenities_rels_path_idx" ON "amenities_rels" USING btree ("path");
    CREATE INDEX "amenities_rels_media_id_idx" ON "amenities_rels" USING btree ("media_id");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "amenity_groups_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "amenities_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenity_groups_fk" FOREIGN KEY ("amenity_groups_id") REFERENCES "public"."amenity_groups"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_amenity_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("amenity_groups_id");
    CREATE INDEX "payload_locked_documents_rels_amenities_id_idx" ON "payload_locked_documents_rels" USING btree ("amenities_id");
  `)
}
