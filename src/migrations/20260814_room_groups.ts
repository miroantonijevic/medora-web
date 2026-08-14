import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "room_groups" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar NOT NULL,
      "property_id" integer NOT NULL,
      "parent_id" integer,
      "hero_image_id" integer,
      "order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "room_groups_locales" (
      "name" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "group_id" integer;

    ALTER TABLE "room_groups"
      ADD CONSTRAINT "room_groups_property_id_properties_id_fk"
      FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "room_groups"
      ADD CONSTRAINT "room_groups_parent_id_room_groups_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."room_groups"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "room_groups"
      ADD CONSTRAINT "room_groups_hero_image_id_media_id_fk"
      FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "room_groups_locales"
      ADD CONSTRAINT "room_groups_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."room_groups"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "rooms"
      ADD CONSTRAINT "rooms_group_id_room_groups_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."room_groups"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE UNIQUE INDEX "room_groups_slug_idx" ON "room_groups" USING btree ("slug");
    CREATE INDEX "room_groups_property_idx" ON "room_groups" USING btree ("property_id");
    CREATE INDEX "room_groups_parent_idx" ON "room_groups" USING btree ("parent_id");
    CREATE INDEX "room_groups_locales_locale_parent_id_locale_idx"
      ON "room_groups_locales" USING btree ("_locale", "_parent_id");
    CREATE INDEX "rooms_group_idx" ON "rooms" USING btree ("group_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "rooms_group_id_room_groups_id_fk";
    DROP INDEX IF EXISTS "rooms_group_idx";
    ALTER TABLE "rooms" DROP COLUMN IF EXISTS "group_id";
    DROP TABLE IF EXISTS "room_groups_locales";
    DROP TABLE IF EXISTS "room_groups";
  `)
}
