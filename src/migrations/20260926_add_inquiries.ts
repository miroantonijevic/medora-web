import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Baseline migration for the Inquiries collection — it was added to the codebase after the
// last committed migration and only ever existed locally via dev-mode schema push, so no prior
// migration ever created this table. Schema here reflects the final childrenYoung/childrenOld
// shape (age-band counts matching medorahotels.com's real quick-inquiry form), not the older
// single 'children' field some local dev databases may still have from before that split.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'contacted', 'closed', 'spam');

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
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_inquiries_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_inquiries_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "inquiries_id";

    DROP TABLE IF EXISTS "inquiries" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_inquiries_status";
  `)
}
