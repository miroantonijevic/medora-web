import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_cta_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_cta_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_cta_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_content_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_content_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_content_section_image_position" AS ENUM('right', 'below');
  CREATE TYPE "public"."enum_pages_blocks_content_section_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_section_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_content_section_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_content_section_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_media_block_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_media_block_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_media_block_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_media_block_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'infoCard');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_content_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_content_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_image_position" AS ENUM('right', 'below');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_width" AS ENUM('standard', 'narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_spacing" AS ENUM('none', 'small', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_background" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'infoCard');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_properties_type" AS ENUM('hotel', 'camp');
  CREATE TYPE "public"."enum_rooms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rooms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rooms_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_offers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offers_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'contacted', 'closed', 'spam');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_auri_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__auri_homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__auri_homepage_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TYPE "public"."enum_orbis_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__orbis_homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__orbis_homepage_v_published_locale" AS ENUM('en', 'hr', 'de');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"layout_settings_width" "enum_pages_blocks_cta_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_cta_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_cta_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_cta_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout_settings_width" "enum_pages_blocks_content_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_content_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_content_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_content_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum_pages_blocks_content_section_image_position" DEFAULT 'right',
  	"cta_link" varchar,
  	"layout_settings_width" "enum_pages_blocks_content_section_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_content_section_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_content_section_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_content_section_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_section_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout_settings_width" "enum_pages_blocks_card_grid_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_card_grid_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_card_grid_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_card_grid_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid_locales" (
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"layout_settings_width" "enum_pages_blocks_media_block_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_media_block_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_media_block_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_media_block_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
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
  	"layout_settings_width" "enum_pages_blocks_photo_gallery_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_photo_gallery_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_photo_gallery_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_photo_gallery_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_gallery_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lat" numeric,
  	"lng" numeric,
  	"zoom" numeric DEFAULT 15,
  	"directions_url" varchar,
  	"layout_settings_width" "enum_pages_blocks_map_embed_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum_pages_blocks_map_embed_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum_pages_blocks_map_embed_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum_pages_blocks_map_embed_layout_settings_background" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"path" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"hero_hero_image_id" integer,
  	"hero_working_hours_text" varchar,
  	"hero_phone" varchar,
  	"hero_email" varchar,
  	"hero_show_inquiry_button" boolean DEFAULT true,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"hero_title" varchar,
  	"hero_card_subtext" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"layout_settings_width" "enum__pages_v_blocks_cta_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_cta_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_cta_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_cta_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout_settings_width" "enum__pages_v_blocks_content_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_content_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_content_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_content_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum__pages_v_blocks_content_section_image_position" DEFAULT 'right',
  	"cta_link" varchar,
  	"layout_settings_width" "enum__pages_v_blocks_content_section_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_content_section_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_content_section_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_content_section_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_section_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout_settings_width" "enum__pages_v_blocks_card_grid_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_card_grid_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_card_grid_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_card_grid_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_locales" (
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"layout_settings_width" "enum__pages_v_blocks_media_block_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_media_block_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_media_block_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_media_block_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
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
  	"layout_settings_width" "enum__pages_v_blocks_photo_gallery_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_photo_gallery_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_photo_gallery_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_photo_gallery_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_gallery_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"lat" numeric,
  	"lng" numeric,
  	"zoom" numeric DEFAULT 15,
  	"directions_url" varchar,
  	"layout_settings_width" "enum__pages_v_blocks_map_embed_layout_settings_width" DEFAULT 'standard',
  	"layout_settings_spacing" "enum__pages_v_blocks_map_embed_layout_settings_spacing" DEFAULT 'standard',
  	"layout_settings_alignment" "enum__pages_v_blocks_map_embed_layout_settings_alignment" DEFAULT 'left',
  	"layout_settings_background" "enum__pages_v_blocks_map_embed_layout_settings_background" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_path" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_hero_hero_image_id" integer,
  	"version_hero_working_hours_text" varchar,
  	"version_hero_phone" varchar,
  	"version_hero_email" varchar,
  	"version_hero_show_inquiry_button" boolean DEFAULT true,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_hero_title" varchar,
  	"version_hero_card_subtext" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"folder_id" integer,
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
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_properties_type" DEFAULT 'hotel' NOT NULL,
  	"coordinates_lat" numeric,
  	"coordinates_lng" numeric,
  	"star_rating" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"address" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
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
  
  CREATE TABLE "rooms_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "rooms_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "rooms_promo_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date_from" timestamp(3) with time zone,
  	"date_to" timestamp(3) with time zone
  );
  
  CREATE TABLE "rooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"property_id" integer,
  	"group_id" integer,
  	"capacity" numeric,
  	"phobs_unit_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_rooms_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "rooms_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"size" varchar,
  	"bed_type" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rooms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_rooms_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_rooms_v_version_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_rooms_v_version_promo_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date_from" timestamp(3) with time zone,
  	"date_to" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_rooms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_property_id" integer,
  	"version_group_id" integer,
  	"version_capacity" numeric,
  	"version_phobs_unit_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__rooms_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__rooms_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_rooms_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"version_size" varchar,
  	"version_bed_type" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_rooms_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "offers_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "offers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"property_id" integer,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_offers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "offers_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_offers_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_property_id" integer,
  	"version_valid_from" timestamp(3) with time zone,
  	"version_valid_until" timestamp(3) with time zone,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offers_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_offers_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "faq_categories_items_locales" (
  	"question" varchar NOT NULL,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "faq_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"arrival" timestamp(3) with time zone,
  	"departure" timestamp(3) with time zone,
  	"adults" numeric DEFAULT 2,
  	"children_young" numeric DEFAULT 0,
  	"children_old" numeric DEFAULT 0,
  	"room_preference" varchar,
  	"message" varchar,
  	"status" "enum_inquiries_status" DEFAULT 'new',
  	"website" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"search_text" varchar,
  	"doc_collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"priority" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"properties_id" integer,
  	"offers_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"properties_id" integer,
  	"room_groups_id" integer,
  	"rooms_id" integer,
  	"offers_id" integer,
  	"faq_categories_id" integer,
  	"inquiries_id" integer,
  	"search_index_id" integer,
  	"redirects_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children_grandchildren_sub_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children_grandchildren_sub_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children_grandchildren" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children_grandchildren_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "main_nav" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'Medora Hotels' NOT NULL,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"favicon_id" integer,
  	"default_og_image_id" integer,
  	"google_analytics_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_canonical_url" varchar,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults_locales" (
  	"default_title" varchar NOT NULL,
  	"default_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "auri_homepage_slides_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "auri_homepage_slides_benefits_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "auri_homepage_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar DEFAULT '/offers/book-directly-and-feel-safe'
  );
  
  CREATE TABLE "auri_homepage_slides_locales" (
  	"headline" varchar DEFAULT 'Book here & get FREE:',
  	"cta_label" varchar DEFAULT 'View offers',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "auri_homepage_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"href" varchar DEFAULT '/offers/book-directly-and-feel-safe'
  );
  
  CREATE TABLE "auri_homepage_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "auri_homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"featured_offer_id" integer,
  	"_status" "enum_auri_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "auri_homepage_locales" (
  	"inclusions_headline" varchar DEFAULT 'Children stay for FREE! Save €483 compared to other hotels for:',
  	"inclusions_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "auri_homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"room_groups_id" integer
  );
  
  CREATE TABLE "_auri_homepage_v_version_slides_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_auri_homepage_v_version_slides_benefits_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_auri_homepage_v_version_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar DEFAULT '/offers/book-directly-and-feel-safe',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_auri_homepage_v_version_slides_locales" (
  	"headline" varchar DEFAULT 'Book here & get FREE:',
  	"cta_label" varchar DEFAULT 'View offers',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_auri_homepage_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"href" varchar DEFAULT '/offers/book-directly-and-feel-safe',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_auri_homepage_v_version_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_auri_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_featured_offer_id" integer,
  	"version__status" "enum__auri_homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__auri_homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_auri_homepage_v_locales" (
  	"version_inclusions_headline" varchar DEFAULT 'Children stay for FREE! Save €483 compared to other hotels for:',
  	"version_inclusions_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_auri_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"room_groups_id" integer
  );
  
  CREATE TABLE "orbis_homepage_slides_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "orbis_homepage_slides_benefits_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "orbis_homepage_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar DEFAULT '/offers/book-directly-and-feel-safe'
  );
  
  CREATE TABLE "orbis_homepage_slides_locales" (
  	"headline" varchar DEFAULT 'Book here & get FREE:',
  	"cta_label" varchar DEFAULT 'View offers',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "orbis_homepage_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"href" varchar DEFAULT '/offers/book-directly-and-feel-safe'
  );
  
  CREATE TABLE "orbis_homepage_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "orbis_homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"featured_offer_id" integer,
  	"_status" "enum_orbis_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "orbis_homepage_locales" (
  	"inclusions_headline" varchar DEFAULT 'Children stay for FREE! Save €483 compared to other hotels for:',
  	"inclusions_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "orbis_homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"room_groups_id" integer
  );
  
  CREATE TABLE "_orbis_homepage_v_version_slides_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orbis_homepage_v_version_slides_benefits_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_orbis_homepage_v_version_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_href" varchar DEFAULT '/offers/book-directly-and-feel-safe',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orbis_homepage_v_version_slides_locales" (
  	"headline" varchar DEFAULT 'Book here & get FREE:',
  	"cta_label" varchar DEFAULT 'View offers',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_orbis_homepage_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"href" varchar DEFAULT '/offers/book-directly-and-feel-safe',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orbis_homepage_v_version_inclusions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_orbis_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_featured_offer_id" integer,
  	"version__status" "enum__orbis_homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__orbis_homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_orbis_homepage_v_locales" (
  	"version_inclusions_headline" varchar DEFAULT 'Children stay for FREE! Save €483 compared to other hotels for:',
  	"version_inclusions_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_orbis_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"room_groups_id" integer
  );
  
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"smtp_host" varchar,
  	"smtp_port" numeric DEFAULT 587,
  	"smtp_secure" boolean DEFAULT false,
  	"smtp_user" varchar,
  	"smtp_password" varchar,
  	"from_name" varchar DEFAULT 'Medora Hotels',
  	"from_email" varchar,
  	"inquiry_recipients" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section_locales" ADD CONSTRAINT "pages_blocks_content_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards_locales" ADD CONSTRAINT "pages_blocks_card_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid" ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_locales" ADD CONSTRAINT "pages_blocks_card_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_images" ADD CONSTRAINT "pages_blocks_photo_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_images" ADD CONSTRAINT "pages_blocks_photo_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery" ADD CONSTRAINT "pages_blocks_photo_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_gallery_locales" ADD CONSTRAINT "pages_blocks_photo_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_hero_image_id_media_id_fk" FOREIGN KEY ("hero_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section_locales" ADD CONSTRAINT "_pages_v_blocks_content_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD CONSTRAINT "_pages_v_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_images" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_images" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_gallery_locales" ADD CONSTRAINT "_pages_v_blocks_photo_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_locales" ADD CONSTRAINT "properties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "room_groups" ADD CONSTRAINT "room_groups_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "room_groups" ADD CONSTRAINT "room_groups_parent_id_room_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."room_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "room_groups" ADD CONSTRAINT "room_groups_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "room_groups_locales" ADD CONSTRAINT "room_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_inclusions" ADD CONSTRAINT "rooms_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_inclusions_locales" ADD CONSTRAINT "rooms_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_promo_dates" ADD CONSTRAINT "rooms_promo_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_group_id_room_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."room_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rooms_locales" ADD CONSTRAINT "rooms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_rels" ADD CONSTRAINT "rooms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_rels" ADD CONSTRAINT "rooms_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v_version_inclusions" ADD CONSTRAINT "_rooms_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rooms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v_version_inclusions_locales" ADD CONSTRAINT "_rooms_v_version_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rooms_v_version_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v_version_promo_dates" ADD CONSTRAINT "_rooms_v_version_promo_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rooms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v" ADD CONSTRAINT "_rooms_v_parent_id_rooms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rooms_v" ADD CONSTRAINT "_rooms_v_version_property_id_properties_id_fk" FOREIGN KEY ("version_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rooms_v" ADD CONSTRAINT "_rooms_v_version_group_id_room_groups_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."room_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rooms_v_locales" ADD CONSTRAINT "_rooms_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rooms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v_rels" ADD CONSTRAINT "_rooms_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_rooms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rooms_v_rels" ADD CONSTRAINT "_rooms_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_gallery" ADD CONSTRAINT "offers_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers_gallery" ADD CONSTRAINT "offers_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers_locales" ADD CONSTRAINT "offers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offers_v_version_gallery" ADD CONSTRAINT "_offers_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v_version_gallery" ADD CONSTRAINT "_offers_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_parent_id_offers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_version_property_id_properties_id_fk" FOREIGN KEY ("version_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v_locales" ADD CONSTRAINT "_offers_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_categories_items" ADD CONSTRAINT "faq_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_categories_items_locales" ADD CONSTRAINT "faq_categories_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_categories_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_categories" ADD CONSTRAINT "faq_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_categories_locales" ADD CONSTRAINT "faq_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_room_groups_fk" FOREIGN KEY ("room_groups_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rooms_fk" FOREIGN KEY ("rooms_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_categories_fk" FOREIGN KEY ("faq_categories_id") REFERENCES "public"."faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_index_fk" FOREIGN KEY ("search_index_id") REFERENCES "public"."search_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children_grandchildren_sub_links" ADD CONSTRAINT "main_nav_items_children_grandchildren_sub_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items_children_grandchildren"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children_grandchildren_sub_links_locales" ADD CONSTRAINT "main_nav_items_children_grandchildren_sub_links_locales_p_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items_children_grandchildren_sub_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children_grandchildren" ADD CONSTRAINT "main_nav_items_children_grandchildren_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children_grandchildren_locales" ADD CONSTRAINT "main_nav_items_children_grandchildren_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items_children_grandchildren"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children" ADD CONSTRAINT "main_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_children_locales" ADD CONSTRAINT "main_nav_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items" ADD CONSTRAINT "main_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "main_nav_items_locales" ADD CONSTRAINT "main_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."main_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_defaults_locales" ADD CONSTRAINT "seo_defaults_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_slides_benefits" ADD CONSTRAINT "auri_homepage_slides_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_slides_benefits_locales" ADD CONSTRAINT "auri_homepage_slides_benefits_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage_slides_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_slides" ADD CONSTRAINT "auri_homepage_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "auri_homepage_slides" ADD CONSTRAINT "auri_homepage_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_slides_locales" ADD CONSTRAINT "auri_homepage_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_inclusions" ADD CONSTRAINT "auri_homepage_inclusions_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "auri_homepage_inclusions" ADD CONSTRAINT "auri_homepage_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_inclusions_locales" ADD CONSTRAINT "auri_homepage_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage" ADD CONSTRAINT "auri_homepage_featured_offer_id_offers_id_fk" FOREIGN KEY ("featured_offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "auri_homepage_locales" ADD CONSTRAINT "auri_homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."auri_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_rels" ADD CONSTRAINT "auri_homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."auri_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auri_homepage_rels" ADD CONSTRAINT "auri_homepage_rels_room_groups_fk" FOREIGN KEY ("room_groups_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_slides_benefits" ADD CONSTRAINT "_auri_homepage_v_version_slides_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_slides_benefits_locales" ADD CONSTRAINT "_auri_homepage_v_version_slides_benefits_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v_version_slides_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_slides" ADD CONSTRAINT "_auri_homepage_v_version_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_slides" ADD CONSTRAINT "_auri_homepage_v_version_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_slides_locales" ADD CONSTRAINT "_auri_homepage_v_version_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_inclusions" ADD CONSTRAINT "_auri_homepage_v_version_inclusions_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_inclusions" ADD CONSTRAINT "_auri_homepage_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_version_inclusions_locales" ADD CONSTRAINT "_auri_homepage_v_version_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v_version_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v" ADD CONSTRAINT "_auri_homepage_v_version_featured_offer_id_offers_id_fk" FOREIGN KEY ("version_featured_offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_locales" ADD CONSTRAINT "_auri_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_auri_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_rels" ADD CONSTRAINT "_auri_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_auri_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_auri_homepage_v_rels" ADD CONSTRAINT "_auri_homepage_v_rels_room_groups_fk" FOREIGN KEY ("room_groups_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_slides_benefits" ADD CONSTRAINT "orbis_homepage_slides_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_slides_benefits_locales" ADD CONSTRAINT "orbis_homepage_slides_benefits_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage_slides_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_slides" ADD CONSTRAINT "orbis_homepage_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orbis_homepage_slides" ADD CONSTRAINT "orbis_homepage_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_slides_locales" ADD CONSTRAINT "orbis_homepage_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_inclusions" ADD CONSTRAINT "orbis_homepage_inclusions_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orbis_homepage_inclusions" ADD CONSTRAINT "orbis_homepage_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_inclusions_locales" ADD CONSTRAINT "orbis_homepage_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage" ADD CONSTRAINT "orbis_homepage_featured_offer_id_offers_id_fk" FOREIGN KEY ("featured_offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orbis_homepage_locales" ADD CONSTRAINT "orbis_homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orbis_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_rels" ADD CONSTRAINT "orbis_homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orbis_homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orbis_homepage_rels" ADD CONSTRAINT "orbis_homepage_rels_room_groups_fk" FOREIGN KEY ("room_groups_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_slides_benefits" ADD CONSTRAINT "_orbis_homepage_v_version_slides_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_slides_benefits_locales" ADD CONSTRAINT "_orbis_homepage_v_version_slides_benefits_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v_version_slides_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_slides" ADD CONSTRAINT "_orbis_homepage_v_version_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_slides" ADD CONSTRAINT "_orbis_homepage_v_version_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_slides_locales" ADD CONSTRAINT "_orbis_homepage_v_version_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_inclusions" ADD CONSTRAINT "_orbis_homepage_v_version_inclusions_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_inclusions" ADD CONSTRAINT "_orbis_homepage_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_version_inclusions_locales" ADD CONSTRAINT "_orbis_homepage_v_version_inclusions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v_version_inclusions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v" ADD CONSTRAINT "_orbis_homepage_v_version_featured_offer_id_offers_id_fk" FOREIGN KEY ("version_featured_offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_locales" ADD CONSTRAINT "_orbis_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orbis_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_rels" ADD CONSTRAINT "_orbis_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_orbis_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orbis_homepage_v_rels" ADD CONSTRAINT "_orbis_homepage_v_rels_room_groups_fk" FOREIGN KEY ("room_groups_id") REFERENCES "public"."room_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_section_order_idx" ON "pages_blocks_content_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_section_parent_id_idx" ON "pages_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_section_path_idx" ON "pages_blocks_content_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_section_image_idx" ON "pages_blocks_content_section" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_content_section_locales_locale_parent_id_unique" ON "pages_blocks_content_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_order_idx" ON "pages_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_parent_id_idx" ON "pages_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_image_idx" ON "pages_blocks_card_grid_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_cards_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_card_grid_order_idx" ON "pages_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_parent_id_idx" ON "pages_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_path_idx" ON "pages_blocks_card_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_card_grid_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_photo_gallery_images_order_idx" ON "pages_blocks_photo_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_gallery_images_parent_id_idx" ON "pages_blocks_photo_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_gallery_images_image_idx" ON "pages_blocks_photo_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_photo_gallery_order_idx" ON "pages_blocks_photo_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_gallery_parent_id_idx" ON "pages_blocks_photo_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_gallery_path_idx" ON "pages_blocks_photo_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_photo_gallery_locales_locale_parent_id_unique" ON "pages_blocks_photo_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_map_embed_order_idx" ON "pages_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_parent_id_idx" ON "pages_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_path_idx" ON "pages_blocks_map_embed" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_hero_hero_hero_image_idx" ON "pages" USING btree ("hero_hero_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_section_order_idx" ON "_pages_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_section_parent_id_idx" ON "_pages_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_section_path_idx" ON "_pages_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_section_image_idx" ON "_pages_v_blocks_content_section" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_section_locales_locale_parent_id_uni" ON "_pages_v_blocks_content_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_order_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_parent_id_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_image_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_cards_locales_locale_parent_id_uni" ON "_pages_v_blocks_card_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_order_idx" ON "_pages_v_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_parent_id_idx" ON "_pages_v_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_path_idx" ON "_pages_v_blocks_card_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_locales_locale_parent_id_unique" ON "_pages_v_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_order_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_parent_id_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_images_image_idx" ON "_pages_v_blocks_photo_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_order_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_gallery_parent_id_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_gallery_path_idx" ON "_pages_v_blocks_photo_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_photo_gallery_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_photo_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_order_idx" ON "_pages_v_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_parent_id_idx" ON "_pages_v_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_path_idx" ON "_pages_v_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_hero_image_idx" ON "_pages_v" USING btree ("version_hero_hero_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_locale_idx" ON "categories_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE UNIQUE INDEX "properties_locales_locale_parent_id_unique" ON "properties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "room_groups_slug_idx" ON "room_groups" USING btree ("slug");
  CREATE INDEX "room_groups_property_idx" ON "room_groups" USING btree ("property_id");
  CREATE INDEX "room_groups_parent_idx" ON "room_groups" USING btree ("parent_id");
  CREATE INDEX "room_groups_hero_image_idx" ON "room_groups" USING btree ("hero_image_id");
  CREATE INDEX "room_groups_updated_at_idx" ON "room_groups" USING btree ("updated_at");
  CREATE INDEX "room_groups_created_at_idx" ON "room_groups" USING btree ("created_at");
  CREATE UNIQUE INDEX "room_groups_locales_locale_parent_id_unique" ON "room_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_inclusions_order_idx" ON "rooms_inclusions" USING btree ("_order");
  CREATE INDEX "rooms_inclusions_parent_id_idx" ON "rooms_inclusions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rooms_inclusions_locales_locale_parent_id_unique" ON "rooms_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_promo_dates_order_idx" ON "rooms_promo_dates" USING btree ("_order");
  CREATE INDEX "rooms_promo_dates_parent_id_idx" ON "rooms_promo_dates" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rooms_slug_idx" ON "rooms" USING btree ("slug");
  CREATE INDEX "rooms_property_idx" ON "rooms" USING btree ("property_id");
  CREATE INDEX "rooms_group_idx" ON "rooms" USING btree ("group_id");
  CREATE INDEX "rooms_updated_at_idx" ON "rooms" USING btree ("updated_at");
  CREATE INDEX "rooms_created_at_idx" ON "rooms" USING btree ("created_at");
  CREATE INDEX "rooms__status_idx" ON "rooms" USING btree ("_status");
  CREATE UNIQUE INDEX "rooms_locales_locale_parent_id_unique" ON "rooms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_rels_order_idx" ON "rooms_rels" USING btree ("order");
  CREATE INDEX "rooms_rels_parent_idx" ON "rooms_rels" USING btree ("parent_id");
  CREATE INDEX "rooms_rels_path_idx" ON "rooms_rels" USING btree ("path");
  CREATE INDEX "rooms_rels_media_id_idx" ON "rooms_rels" USING btree ("media_id");
  CREATE INDEX "_rooms_v_version_inclusions_order_idx" ON "_rooms_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_rooms_v_version_inclusions_parent_id_idx" ON "_rooms_v_version_inclusions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_rooms_v_version_inclusions_locales_locale_parent_id_unique" ON "_rooms_v_version_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_rooms_v_version_promo_dates_order_idx" ON "_rooms_v_version_promo_dates" USING btree ("_order");
  CREATE INDEX "_rooms_v_version_promo_dates_parent_id_idx" ON "_rooms_v_version_promo_dates" USING btree ("_parent_id");
  CREATE INDEX "_rooms_v_parent_idx" ON "_rooms_v" USING btree ("parent_id");
  CREATE INDEX "_rooms_v_version_version_slug_idx" ON "_rooms_v" USING btree ("version_slug");
  CREATE INDEX "_rooms_v_version_version_property_idx" ON "_rooms_v" USING btree ("version_property_id");
  CREATE INDEX "_rooms_v_version_version_group_idx" ON "_rooms_v" USING btree ("version_group_id");
  CREATE INDEX "_rooms_v_version_version_updated_at_idx" ON "_rooms_v" USING btree ("version_updated_at");
  CREATE INDEX "_rooms_v_version_version_created_at_idx" ON "_rooms_v" USING btree ("version_created_at");
  CREATE INDEX "_rooms_v_version_version__status_idx" ON "_rooms_v" USING btree ("version__status");
  CREATE INDEX "_rooms_v_created_at_idx" ON "_rooms_v" USING btree ("created_at");
  CREATE INDEX "_rooms_v_updated_at_idx" ON "_rooms_v" USING btree ("updated_at");
  CREATE INDEX "_rooms_v_snapshot_idx" ON "_rooms_v" USING btree ("snapshot");
  CREATE INDEX "_rooms_v_published_locale_idx" ON "_rooms_v" USING btree ("published_locale");
  CREATE INDEX "_rooms_v_latest_idx" ON "_rooms_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_rooms_v_locales_locale_parent_id_unique" ON "_rooms_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_rooms_v_rels_order_idx" ON "_rooms_v_rels" USING btree ("order");
  CREATE INDEX "_rooms_v_rels_parent_idx" ON "_rooms_v_rels" USING btree ("parent_id");
  CREATE INDEX "_rooms_v_rels_path_idx" ON "_rooms_v_rels" USING btree ("path");
  CREATE INDEX "_rooms_v_rels_media_id_idx" ON "_rooms_v_rels" USING btree ("media_id");
  CREATE INDEX "offers_gallery_order_idx" ON "offers_gallery" USING btree ("_order");
  CREATE INDEX "offers_gallery_parent_id_idx" ON "offers_gallery" USING btree ("_parent_id");
  CREATE INDEX "offers_gallery_image_idx" ON "offers_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "offers_slug_idx" ON "offers" USING btree ("slug");
  CREATE INDEX "offers_property_idx" ON "offers" USING btree ("property_id");
  CREATE INDEX "offers_hero_image_idx" ON "offers" USING btree ("hero_image_id");
  CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");
  CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");
  CREATE INDEX "offers__status_idx" ON "offers" USING btree ("_status");
  CREATE UNIQUE INDEX "offers_locales_locale_parent_id_unique" ON "offers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offers_v_version_gallery_order_idx" ON "_offers_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_offers_v_version_gallery_parent_id_idx" ON "_offers_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_offers_v_version_gallery_image_idx" ON "_offers_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_offers_v_parent_idx" ON "_offers_v" USING btree ("parent_id");
  CREATE INDEX "_offers_v_version_version_slug_idx" ON "_offers_v" USING btree ("version_slug");
  CREATE INDEX "_offers_v_version_version_property_idx" ON "_offers_v" USING btree ("version_property_id");
  CREATE INDEX "_offers_v_version_version_hero_image_idx" ON "_offers_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_offers_v_version_version_updated_at_idx" ON "_offers_v" USING btree ("version_updated_at");
  CREATE INDEX "_offers_v_version_version_created_at_idx" ON "_offers_v" USING btree ("version_created_at");
  CREATE INDEX "_offers_v_version_version__status_idx" ON "_offers_v" USING btree ("version__status");
  CREATE INDEX "_offers_v_created_at_idx" ON "_offers_v" USING btree ("created_at");
  CREATE INDEX "_offers_v_updated_at_idx" ON "_offers_v" USING btree ("updated_at");
  CREATE INDEX "_offers_v_snapshot_idx" ON "_offers_v" USING btree ("snapshot");
  CREATE INDEX "_offers_v_published_locale_idx" ON "_offers_v" USING btree ("published_locale");
  CREATE INDEX "_offers_v_latest_idx" ON "_offers_v" USING btree ("latest");
  CREATE INDEX "_offers_v_autosave_idx" ON "_offers_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_offers_v_locales_locale_parent_id_unique" ON "_offers_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_categories_items_order_idx" ON "faq_categories_items" USING btree ("_order");
  CREATE INDEX "faq_categories_items_parent_id_idx" ON "faq_categories_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "faq_categories_items_locales_locale_parent_id_unique" ON "faq_categories_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "faq_categories_slug_idx" ON "faq_categories" USING btree ("slug");
  CREATE INDEX "faq_categories_image_idx" ON "faq_categories" USING btree ("image_id");
  CREATE INDEX "faq_categories_updated_at_idx" ON "faq_categories" USING btree ("updated_at");
  CREATE INDEX "faq_categories_created_at_idx" ON "faq_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "faq_categories_locales_locale_parent_id_unique" ON "faq_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "search_index_title_idx" ON "search_index" USING btree ("title");
  CREATE INDEX "search_index_slug_idx" ON "search_index" USING btree ("slug");
  CREATE INDEX "search_index_search_text_idx" ON "search_index" USING btree ("search_text");
  CREATE INDEX "search_index_doc_collection_idx" ON "search_index" USING btree ("doc_collection");
  CREATE INDEX "search_index_doc_id_idx" ON "search_index" USING btree ("doc_id");
  CREATE INDEX "search_index_updated_at_idx" ON "search_index" USING btree ("updated_at");
  CREATE INDEX "search_index_created_at_idx" ON "search_index" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "redirects_rels_properties_id_idx" ON "redirects_rels" USING btree ("properties_id");
  CREATE INDEX "redirects_rels_offers_id_idx" ON "redirects_rels" USING btree ("offers_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_room_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("room_groups_id");
  CREATE INDEX "payload_locked_documents_rels_rooms_id_idx" ON "payload_locked_documents_rels" USING btree ("rooms_id");
  CREATE INDEX "payload_locked_documents_rels_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("offers_id");
  CREATE INDEX "payload_locked_documents_rels_faq_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_categories_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_search_index_id_idx" ON "payload_locked_documents_rels" USING btree ("search_index_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "main_nav_items_children_grandchildren_sub_links_order_idx" ON "main_nav_items_children_grandchildren_sub_links" USING btree ("_order");
  CREATE INDEX "main_nav_items_children_grandchildren_sub_links_parent_id_idx" ON "main_nav_items_children_grandchildren_sub_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_nav_items_children_grandchildren_sub_links_locales_loca" ON "main_nav_items_children_grandchildren_sub_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_nav_items_children_grandchildren_order_idx" ON "main_nav_items_children_grandchildren" USING btree ("_order");
  CREATE INDEX "main_nav_items_children_grandchildren_parent_id_idx" ON "main_nav_items_children_grandchildren" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_nav_items_children_grandchildren_locales_locale_parent_" ON "main_nav_items_children_grandchildren_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_nav_items_children_order_idx" ON "main_nav_items_children" USING btree ("_order");
  CREATE INDEX "main_nav_items_children_parent_id_idx" ON "main_nav_items_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_nav_items_children_locales_locale_parent_id_unique" ON "main_nav_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "main_nav_items_order_idx" ON "main_nav_items" USING btree ("_order");
  CREATE INDEX "main_nav_items_parent_id_idx" ON "main_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "main_nav_items_locales_locale_parent_id_unique" ON "main_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_defaults_default_og_image_idx" ON "seo_defaults" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "seo_defaults_locales_locale_parent_id_unique" ON "seo_defaults_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auri_homepage_slides_benefits_order_idx" ON "auri_homepage_slides_benefits" USING btree ("_order");
  CREATE INDEX "auri_homepage_slides_benefits_parent_id_idx" ON "auri_homepage_slides_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "auri_homepage_slides_benefits_locales_locale_parent_id_uniqu" ON "auri_homepage_slides_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auri_homepage_slides_order_idx" ON "auri_homepage_slides" USING btree ("_order");
  CREATE INDEX "auri_homepage_slides_parent_id_idx" ON "auri_homepage_slides" USING btree ("_parent_id");
  CREATE INDEX "auri_homepage_slides_image_idx" ON "auri_homepage_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "auri_homepage_slides_locales_locale_parent_id_unique" ON "auri_homepage_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auri_homepage_inclusions_order_idx" ON "auri_homepage_inclusions" USING btree ("_order");
  CREATE INDEX "auri_homepage_inclusions_parent_id_idx" ON "auri_homepage_inclusions" USING btree ("_parent_id");
  CREATE INDEX "auri_homepage_inclusions_icon_idx" ON "auri_homepage_inclusions" USING btree ("icon_id");
  CREATE UNIQUE INDEX "auri_homepage_inclusions_locales_locale_parent_id_unique" ON "auri_homepage_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auri_homepage_featured_offer_idx" ON "auri_homepage" USING btree ("featured_offer_id");
  CREATE INDEX "auri_homepage__status_idx" ON "auri_homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "auri_homepage_locales_locale_parent_id_unique" ON "auri_homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "auri_homepage_rels_order_idx" ON "auri_homepage_rels" USING btree ("order");
  CREATE INDEX "auri_homepage_rels_parent_idx" ON "auri_homepage_rels" USING btree ("parent_id");
  CREATE INDEX "auri_homepage_rels_path_idx" ON "auri_homepage_rels" USING btree ("path");
  CREATE INDEX "auri_homepage_rels_room_groups_id_idx" ON "auri_homepage_rels" USING btree ("room_groups_id");
  CREATE INDEX "_auri_homepage_v_version_slides_benefits_order_idx" ON "_auri_homepage_v_version_slides_benefits" USING btree ("_order");
  CREATE INDEX "_auri_homepage_v_version_slides_benefits_parent_id_idx" ON "_auri_homepage_v_version_slides_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_auri_homepage_v_version_slides_benefits_locales_locale_pare" ON "_auri_homepage_v_version_slides_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_auri_homepage_v_version_slides_order_idx" ON "_auri_homepage_v_version_slides" USING btree ("_order");
  CREATE INDEX "_auri_homepage_v_version_slides_parent_id_idx" ON "_auri_homepage_v_version_slides" USING btree ("_parent_id");
  CREATE INDEX "_auri_homepage_v_version_slides_image_idx" ON "_auri_homepage_v_version_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "_auri_homepage_v_version_slides_locales_locale_parent_id_uni" ON "_auri_homepage_v_version_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_auri_homepage_v_version_inclusions_order_idx" ON "_auri_homepage_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_auri_homepage_v_version_inclusions_parent_id_idx" ON "_auri_homepage_v_version_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_auri_homepage_v_version_inclusions_icon_idx" ON "_auri_homepage_v_version_inclusions" USING btree ("icon_id");
  CREATE UNIQUE INDEX "_auri_homepage_v_version_inclusions_locales_locale_parent_id" ON "_auri_homepage_v_version_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_auri_homepage_v_version_version_featured_offer_idx" ON "_auri_homepage_v" USING btree ("version_featured_offer_id");
  CREATE INDEX "_auri_homepage_v_version_version__status_idx" ON "_auri_homepage_v" USING btree ("version__status");
  CREATE INDEX "_auri_homepage_v_created_at_idx" ON "_auri_homepage_v" USING btree ("created_at");
  CREATE INDEX "_auri_homepage_v_updated_at_idx" ON "_auri_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_auri_homepage_v_snapshot_idx" ON "_auri_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_auri_homepage_v_published_locale_idx" ON "_auri_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_auri_homepage_v_latest_idx" ON "_auri_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_auri_homepage_v_locales_locale_parent_id_unique" ON "_auri_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_auri_homepage_v_rels_order_idx" ON "_auri_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_auri_homepage_v_rels_parent_idx" ON "_auri_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_auri_homepage_v_rels_path_idx" ON "_auri_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_auri_homepage_v_rels_room_groups_id_idx" ON "_auri_homepage_v_rels" USING btree ("room_groups_id");
  CREATE INDEX "orbis_homepage_slides_benefits_order_idx" ON "orbis_homepage_slides_benefits" USING btree ("_order");
  CREATE INDEX "orbis_homepage_slides_benefits_parent_id_idx" ON "orbis_homepage_slides_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orbis_homepage_slides_benefits_locales_locale_parent_id_uniq" ON "orbis_homepage_slides_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "orbis_homepage_slides_order_idx" ON "orbis_homepage_slides" USING btree ("_order");
  CREATE INDEX "orbis_homepage_slides_parent_id_idx" ON "orbis_homepage_slides" USING btree ("_parent_id");
  CREATE INDEX "orbis_homepage_slides_image_idx" ON "orbis_homepage_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "orbis_homepage_slides_locales_locale_parent_id_unique" ON "orbis_homepage_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "orbis_homepage_inclusions_order_idx" ON "orbis_homepage_inclusions" USING btree ("_order");
  CREATE INDEX "orbis_homepage_inclusions_parent_id_idx" ON "orbis_homepage_inclusions" USING btree ("_parent_id");
  CREATE INDEX "orbis_homepage_inclusions_icon_idx" ON "orbis_homepage_inclusions" USING btree ("icon_id");
  CREATE UNIQUE INDEX "orbis_homepage_inclusions_locales_locale_parent_id_unique" ON "orbis_homepage_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "orbis_homepage_featured_offer_idx" ON "orbis_homepage" USING btree ("featured_offer_id");
  CREATE INDEX "orbis_homepage__status_idx" ON "orbis_homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "orbis_homepage_locales_locale_parent_id_unique" ON "orbis_homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "orbis_homepage_rels_order_idx" ON "orbis_homepage_rels" USING btree ("order");
  CREATE INDEX "orbis_homepage_rels_parent_idx" ON "orbis_homepage_rels" USING btree ("parent_id");
  CREATE INDEX "orbis_homepage_rels_path_idx" ON "orbis_homepage_rels" USING btree ("path");
  CREATE INDEX "orbis_homepage_rels_room_groups_id_idx" ON "orbis_homepage_rels" USING btree ("room_groups_id");
  CREATE INDEX "_orbis_homepage_v_version_slides_benefits_order_idx" ON "_orbis_homepage_v_version_slides_benefits" USING btree ("_order");
  CREATE INDEX "_orbis_homepage_v_version_slides_benefits_parent_id_idx" ON "_orbis_homepage_v_version_slides_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_orbis_homepage_v_version_slides_benefits_locales_locale_par" ON "_orbis_homepage_v_version_slides_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_orbis_homepage_v_version_slides_order_idx" ON "_orbis_homepage_v_version_slides" USING btree ("_order");
  CREATE INDEX "_orbis_homepage_v_version_slides_parent_id_idx" ON "_orbis_homepage_v_version_slides" USING btree ("_parent_id");
  CREATE INDEX "_orbis_homepage_v_version_slides_image_idx" ON "_orbis_homepage_v_version_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "_orbis_homepage_v_version_slides_locales_locale_parent_id_un" ON "_orbis_homepage_v_version_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_orbis_homepage_v_version_inclusions_order_idx" ON "_orbis_homepage_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_orbis_homepage_v_version_inclusions_parent_id_idx" ON "_orbis_homepage_v_version_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_orbis_homepage_v_version_inclusions_icon_idx" ON "_orbis_homepage_v_version_inclusions" USING btree ("icon_id");
  CREATE UNIQUE INDEX "_orbis_homepage_v_version_inclusions_locales_locale_parent_i" ON "_orbis_homepage_v_version_inclusions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_orbis_homepage_v_version_version_featured_offer_idx" ON "_orbis_homepage_v" USING btree ("version_featured_offer_id");
  CREATE INDEX "_orbis_homepage_v_version_version__status_idx" ON "_orbis_homepage_v" USING btree ("version__status");
  CREATE INDEX "_orbis_homepage_v_created_at_idx" ON "_orbis_homepage_v" USING btree ("created_at");
  CREATE INDEX "_orbis_homepage_v_updated_at_idx" ON "_orbis_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_orbis_homepage_v_snapshot_idx" ON "_orbis_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_orbis_homepage_v_published_locale_idx" ON "_orbis_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_orbis_homepage_v_latest_idx" ON "_orbis_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_orbis_homepage_v_locales_locale_parent_id_unique" ON "_orbis_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_orbis_homepage_v_rels_order_idx" ON "_orbis_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_orbis_homepage_v_rels_parent_idx" ON "_orbis_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_orbis_homepage_v_rels_path_idx" ON "_orbis_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_orbis_homepage_v_rels_room_groups_id_idx" ON "_orbis_homepage_v_rels" USING btree ("room_groups_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_content_section" CASCADE;
  DROP TABLE "pages_blocks_content_section_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_card_grid" CASCADE;
  DROP TABLE "pages_blocks_card_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery" CASCADE;
  DROP TABLE "pages_blocks_photo_gallery_locales" CASCADE;
  DROP TABLE "pages_blocks_map_embed" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_content_section" CASCADE;
  DROP TABLE "_pages_v_blocks_content_section_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_gallery_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_locales" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "room_groups" CASCADE;
  DROP TABLE "room_groups_locales" CASCADE;
  DROP TABLE "rooms_inclusions" CASCADE;
  DROP TABLE "rooms_inclusions_locales" CASCADE;
  DROP TABLE "rooms_promo_dates" CASCADE;
  DROP TABLE "rooms" CASCADE;
  DROP TABLE "rooms_locales" CASCADE;
  DROP TABLE "rooms_rels" CASCADE;
  DROP TABLE "_rooms_v_version_inclusions" CASCADE;
  DROP TABLE "_rooms_v_version_inclusions_locales" CASCADE;
  DROP TABLE "_rooms_v_version_promo_dates" CASCADE;
  DROP TABLE "_rooms_v" CASCADE;
  DROP TABLE "_rooms_v_locales" CASCADE;
  DROP TABLE "_rooms_v_rels" CASCADE;
  DROP TABLE "offers_gallery" CASCADE;
  DROP TABLE "offers" CASCADE;
  DROP TABLE "offers_locales" CASCADE;
  DROP TABLE "_offers_v_version_gallery" CASCADE;
  DROP TABLE "_offers_v" CASCADE;
  DROP TABLE "_offers_v_locales" CASCADE;
  DROP TABLE "faq_categories_items" CASCADE;
  DROP TABLE "faq_categories_items_locales" CASCADE;
  DROP TABLE "faq_categories" CASCADE;
  DROP TABLE "faq_categories_locales" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "search_index" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "main_nav_items_children_grandchildren_sub_links" CASCADE;
  DROP TABLE "main_nav_items_children_grandchildren_sub_links_locales" CASCADE;
  DROP TABLE "main_nav_items_children_grandchildren" CASCADE;
  DROP TABLE "main_nav_items_children_grandchildren_locales" CASCADE;
  DROP TABLE "main_nav_items_children" CASCADE;
  DROP TABLE "main_nav_items_children_locales" CASCADE;
  DROP TABLE "main_nav_items" CASCADE;
  DROP TABLE "main_nav_items_locales" CASCADE;
  DROP TABLE "main_nav" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "seo_defaults_locales" CASCADE;
  DROP TABLE "auri_homepage_slides_benefits" CASCADE;
  DROP TABLE "auri_homepage_slides_benefits_locales" CASCADE;
  DROP TABLE "auri_homepage_slides" CASCADE;
  DROP TABLE "auri_homepage_slides_locales" CASCADE;
  DROP TABLE "auri_homepage_inclusions" CASCADE;
  DROP TABLE "auri_homepage_inclusions_locales" CASCADE;
  DROP TABLE "auri_homepage" CASCADE;
  DROP TABLE "auri_homepage_locales" CASCADE;
  DROP TABLE "auri_homepage_rels" CASCADE;
  DROP TABLE "_auri_homepage_v_version_slides_benefits" CASCADE;
  DROP TABLE "_auri_homepage_v_version_slides_benefits_locales" CASCADE;
  DROP TABLE "_auri_homepage_v_version_slides" CASCADE;
  DROP TABLE "_auri_homepage_v_version_slides_locales" CASCADE;
  DROP TABLE "_auri_homepage_v_version_inclusions" CASCADE;
  DROP TABLE "_auri_homepage_v_version_inclusions_locales" CASCADE;
  DROP TABLE "_auri_homepage_v" CASCADE;
  DROP TABLE "_auri_homepage_v_locales" CASCADE;
  DROP TABLE "_auri_homepage_v_rels" CASCADE;
  DROP TABLE "orbis_homepage_slides_benefits" CASCADE;
  DROP TABLE "orbis_homepage_slides_benefits_locales" CASCADE;
  DROP TABLE "orbis_homepage_slides" CASCADE;
  DROP TABLE "orbis_homepage_slides_locales" CASCADE;
  DROP TABLE "orbis_homepage_inclusions" CASCADE;
  DROP TABLE "orbis_homepage_inclusions_locales" CASCADE;
  DROP TABLE "orbis_homepage" CASCADE;
  DROP TABLE "orbis_homepage_locales" CASCADE;
  DROP TABLE "orbis_homepage_rels" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_slides_benefits" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_slides_benefits_locales" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_slides" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_slides_locales" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_inclusions" CASCADE;
  DROP TABLE "_orbis_homepage_v_version_inclusions_locales" CASCADE;
  DROP TABLE "_orbis_homepage_v" CASCADE;
  DROP TABLE "_orbis_homepage_v_locales" CASCADE;
  DROP TABLE "_orbis_homepage_v_rels" CASCADE;
  DROP TABLE "email_settings" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_cta_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_cta_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_cta_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_content_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_content_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_content_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_content_section_image_position";
  DROP TYPE "public"."enum_pages_blocks_content_section_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_content_section_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_content_section_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_content_section_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_card_grid_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_card_grid_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_card_grid_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_card_grid_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_media_block_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_media_block_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_media_block_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_media_block_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_photo_gallery_layout_settings_background";
  DROP TYPE "public"."enum_pages_blocks_map_embed_layout_settings_width";
  DROP TYPE "public"."enum_pages_blocks_map_embed_layout_settings_spacing";
  DROP TYPE "public"."enum_pages_blocks_map_embed_layout_settings_alignment";
  DROP TYPE "public"."enum_pages_blocks_map_embed_layout_settings_background";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_cta_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_cta_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_cta_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_content_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_content_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_content_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_photo_gallery_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_width";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_layout_settings_background";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_properties_type";
  DROP TYPE "public"."enum_rooms_status";
  DROP TYPE "public"."enum__rooms_v_version_status";
  DROP TYPE "public"."enum__rooms_v_published_locale";
  DROP TYPE "public"."enum_offers_status";
  DROP TYPE "public"."enum__offers_v_version_status";
  DROP TYPE "public"."enum__offers_v_published_locale";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_auri_homepage_status";
  DROP TYPE "public"."enum__auri_homepage_v_version_status";
  DROP TYPE "public"."enum__auri_homepage_v_published_locale";
  DROP TYPE "public"."enum_orbis_homepage_status";
  DROP TYPE "public"."enum__orbis_homepage_v_version_status";
  DROP TYPE "public"."enum__orbis_homepage_v_published_locale";`)
}
