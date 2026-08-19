import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_destination_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"working_hours_text" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"show_inquiry_button" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_destination_hero_locales" (
  	"title" varchar,
  	"card_subtext" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_photo_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_photo_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_gallery_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_destination_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"working_hours_text" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"show_inquiry_button" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_destination_hero_locales" (
  	"title" varchar,
  	"card_subtext" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_photo_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_gallery_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_destination_hero" ADD CONSTRAINT "pages_blocks_destination_hero_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_destination_hero" ADD CONSTRAINT "pages_blocks_destination_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_destination_hero_locales" ADD CONSTRAINT "pages_blocks_destination_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_destination_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_images" ADD CONSTRAINT "pages_blocks_photo_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_images" ADD CONSTRAINT "pages_blocks_photo_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery" ADD CONSTRAINT "pages_blocks_photo_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_locales" ADD CONSTRAINT "pages_blocks_photo_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_destination_hero" ADD CONSTRAINT "_pages_v_blocks_destination_hero_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_destination_hero" ADD CONSTRAINT "_pages_v_blocks_destination_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_destination_hero_locales" ADD CONSTRAINT "_pages_v_blocks_destination_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_destination_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_images" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_images" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_locales" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_destination_hero_order_idx" ON "pages_blocks_destination_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_destination_hero_parent_id_idx" ON "pages_blocks_destination_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_destination_hero_path_idx" ON "pages_blocks_destination_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_destination_hero_hero_image_idx" ON "pages_blocks_destination_hero" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "pages_blocks_destination_hero_locales_locale_parent_id_uniqu" ON "pages_blocks_destination_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_photo_gallery_images_order_idx" ON "pages_blocks_photo_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_gallery_images_parent_id_idx" ON "pages_blocks_photo_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_gallery_images_image_idx" ON "pages_blocks_photo_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_photo_gallery_order_idx" ON "pages_blocks_photo_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_gallery_parent_id_idx" ON "pages_blocks_photo_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_gallery_path_idx" ON "pages_blocks_photo_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_photo_gallery_locales_locale_parent_id_unique" ON "pages_blocks_photo_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_destination_hero_order_idx" ON "_pages_v_blocks_destination_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_destination_hero_parent_id_idx" ON "_pages_v_blocks_destination_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_destination_hero_path_idx" ON "_pages_v_blocks_destination_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_destination_hero_hero_image_idx" ON "_pages_v_blocks_destination_hero" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_destination_hero_locales_locale_parent_id_un" ON "_pages_v_blocks_destination_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_order_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_parent_id_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_image_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_order_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_gallery_parent_id_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_path_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_photo_gallery_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_photo_gallery_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_destination_hero" CASCADE;
  DROP TABLE "pages_blocks_destination_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_destination_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_destination_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery_locales" CASCADE;`)
}
