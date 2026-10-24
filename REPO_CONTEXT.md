# Repo context

Only what the code does not tell you. Stack, folders and scripts are in `package.json` and the tree. Keep this file true: update it in the
same change that makes it wrong. How to change the system is in ENGINEERING_GUIDELINES.md.

## What it is

Website and CMS for Medora Hotels: Medora Auri Family Beach Resort (`medora-auri`) and Luxury Camp Orbis (`luxury-camp-orbis`).
Next.js with Payload embedded in the same process; public site and admin in en, hr and de; Phobs PMS for availability, rates and booking.
Started from the Payload Website Template, so the README is generic template text.

## Non-obvious decisions

- **Search:** `globalSearchIndexPlugin` replaces `@payloadcms/plugin-search` on purpose. The plugin created duplicate entries on localized collections.
- **Property homepages:** AuriHomepage and OrbisHomepage are one factory in `globals/PropertyHomepage.ts`. The two property slugs the site is built around (`medora-auri`, `luxury-camp-orbis`) are constants in `src/lib/properties.ts`.
- **Rooms and groups:** RoomGroups are hierarchical and also model amenity groups. Rooms carry `phobsUnitId`.
- **Roles:** `admin` and `editor`, stored in the JWT so access checks need no extra lookup.
- **Inquiries:** public create without login. Email is sent by the `sendInquiryEmails` hook using the `email-settings` global (password encrypted).
- **Media files:** Media accepts images, video and PDF (the sustainability reports are PDFs in the "Documents" folder). Payload serves every file at `/api/media/file/<name>`. Next only serves files that were in `public/` at startup, so `/media/<name>` links (older page content has them) are rewritten to that route in `next.config.ts`. Payload answers 500, not 404, for a file that is missing on disk.
- **Revalidation:** the pages read Payload directly, without Next cache tags, so tag-based revalidation alone never reached them and a cached page stayed stale for a year (`s-maxage=31536000`). `/next/revalidate` therefore also calls `revalidatePath('/', 'layout')`, dropping every cached page. It is triggered by `revalidateCollectionHook` (properties, rooms, room-groups, offers, faq-categories) and `revalidateGlobalHook` (main-nav, site-settings, seo-defaults); Pages, Posts and the homepages use their own `revalidatePath` hooks. Checked in a running container: an edit through the REST API shows on the page immediately. Drafts and live preview go through `/api/draft`.
- **Build without a database:** `generateStaticParams` goes through `staticParamsOrEmpty` (`src/lib/staticParams.ts`), so `next build` (and the Docker image build) needs neither a database nor `PAYLOAD_SECRET`. Pages are then rendered on the first request and cached. Verified with the unmodified Dockerfile.
- **Migrations:** one baseline migration (`src/migrations/20261024_125454_baseline`) builds the whole schema; on an empty database `payload migrate` gives exactly the schema Payload builds from the config (checked column by column, 2026-10-24). Development uses Payload's dev-mode push, so after changing a collection, global or block run `pnpm payload migrate:create <name>` and commit the result. `docker-entrypoint.sh` applies migrations on container start, so a schema change without one breaks the deploy.
- **Git-ignored local files:** `.env`, `todo.txt`, `migrate-output.txt`, `tsconfig.tsbuildinfo`.

## Phobs

`src/lib/phobs.ts` is server-only (credentials). Guests are redirected to the Phobs booking page in production (`phobsBookingLink.ts`).
Direct booking creation works only for one unit on the Phobs test account (`TEST_MODE_UNIT_IDS`, env `PHOBS_TEST_*`). Other units get
`403 not_available_yet` until production has the `PCBookingNew` permission; then remove the test-mode code. `lib/booking.ts` is the fallback to `/inquiry`.

## Known debt

Do not fix as a side effect of another task; propose it first.

- Rate limits live in nginx only (`phobs_read`, `phobs_book`, `inquiry` zones), so local dev is unlimited. If a CDN or load balancer is put in front, add the commented `set_real_ip_from` block in nginx.conf first, or all visitors share one limit.
- `/api/phobs/book` is public; acceptable only while restricted to the test unit.
- Seeds (`/next/seed-*`, `organize-media-folders`) were run on an empty database: they succeed and are idempotent, provided `public/media` is empty. Payload names a new upload `parking-1.svg` when `parking.svg` already exists on disk, so seeding next to an existing media folder duplicates files on every run. They fetch images from the live medorahotels.com (checked 2026-10-24: all 94 referenced URLs resolve). Five images that the live site no longer has were dropped on purpose: the hero of Dining & Bars and How to reach us (plain title instead) and the images of the Spa, Fitness and Taste the Indigo content blocks. The seeded offers match the live site's five (checked 2026-10-24): the two 2027 "waiting list" offers (English only; hr/de fall back to English because the live site has no translation) and family holiday and one summer in Orbis (no dates, as on the live site) are listed; "Book directly" ends on 1 Sept 2026 by its own text, so it stays reachable by its link but is not listed. Seeds only add and update: offers removed from the seed (last-minute free lunch, luxury camping with hotel breakfast) stay in a database that already has them.
- Tests: Phobs parameter validation, timeout and XML parsing, and the inquiry form (access, honeypot, emails) have integration tests in `tests/int`. Nothing covers the booking-creation XML (`getPriceQuote`, `createTestBooking`, `verifyBooking`) or the pages and admin UI; the two e2e specs are the only browser tests.
- `PhobsRatePlan.bookUrl` is parsed but unused (the UI builds the link with `phobsBookingLink.ts`).
