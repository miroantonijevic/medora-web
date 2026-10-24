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
- **Root layout:** the site's `<html>` lives in `src/app/(frontend)/[locale]/layout.tsx` (there is no layout above `[locale]`), so it can set `lang` from the locale param without reading request headers; reading the locale from a layout above `[locale]` would make every page dynamic and lose the page cache. The `/` redirect and the locale prefix come from the next-intl proxy in `src/proxy.ts` (Next 16's name for middleware; it has to sit next to `app`, in `src/`, or `next dev` ignores it). Next's generic 404 shell (`__next_error__`) has no `lang`; changing that needs a global not-found page.
- **Migrations:** one baseline migration (`src/migrations/20261024_125454_baseline`) builds the whole schema; on an empty database `payload migrate` gives exactly the schema Payload builds from the config (checked column by column, 2026-10-24). Development uses Payload's dev-mode push, so after changing a collection, global or block run `pnpm payload migrate:create <name>` and commit the result. `docker-entrypoint.sh` applies migrations on container start, so a schema change without one breaks the deploy.
- **Git-ignored local files:** `.env`, `todo.txt`, `migrate-output.txt`, `tsconfig.tsbuildinfo`.

## Phobs

`src/lib/phobs.ts` is server-only (credentials). Guests are redirected to the Phobs booking page in production (`phobsBookingLink.ts`).
Direct booking creation works only for one unit on the Phobs test account (`TEST_MODE_UNIT_IDS`, env `PHOBS_TEST_*`). Other units get
`403 not_available_yet` until production has the `PCBookingNew` permission; then remove the test-mode code. `lib/booking.ts` is the fallback to `/inquiry`.

Booking popup (`src/components/BookingCalendar`):
- `/api/phobs/rate-details` reads the policies of a rate with PCPriceQuote; the production account may lack that permission until Phobs certifies the integration, and the panel then says the details are unavailable. The inclusions on a rate card come from the rate plan `ShortDescription` in the availability answer and work without it.
- `/api/phobs/deals` ("Show all deals") reads availability only: one property-wide request per Phobs property and environment (test and production units are never mixed), grouped by room group. Phobs does not translate rate names; they show as delivered.
- The cheapest rate is highlighted automatically. `SecurityNotice` ("Secured by Phobs & Monri", encrypted card data) is shown with the rates and above the guest form submit button. Its wording was written ahead of the payment solution: before production, confirm with Phobs and Monri that every claim is true and the names and logos are allowed.

## Known debt

Do not fix as a side effect of another task; propose it first.

- Rate limits live in nginx only (`phobs_read`, `phobs_book`, `inquiry` zones), so local dev is unlimited. If a CDN or load balancer is put in front, add the commented `set_real_ip_from` block in nginx.conf first, or all visitors share one limit.
- `/api/phobs/book` is public; acceptable only while restricted to the test unit.
- Seeds (`/next/seed-*`, `organize-media-folders`) were run on an empty database: they succeed and are idempotent, provided `public/media` is empty. Payload names a new upload `parking-1.svg` when `parking.svg` already exists on disk, so seeding next to an existing media folder duplicates files on every run. They fetch images from the live medorahotels.com (checked 2026-10-24: all 94 referenced URLs resolve). Five images that the live site no longer has were dropped on purpose: the hero of Dining & Bars and How to reach us (plain title instead) and the images of the Spa, Fitness and Taste the Indigo content blocks. The seeded offers match the live site's five (checked 2026-10-24): the two 2027 "waiting list" offers (English only; hr/de fall back to English because the live site has no translation) and family holiday and one summer in Orbis (no dates, as on the live site) are listed; "Book directly" ends on 1 Sept 2026 by its own text, so it stays reachable by its link but is not listed. Seeds only add and update: offers removed from the seed (last-minute free lunch, luxury camping with hotel breakfast) stay in a database that already has them.
- Tests: integration tests in `tests/int` cover Phobs parameter validation, timeout and XML parsing, the inquiry form (access, honeypot, emails, empty dates), revalidation, the health check and the property path mapping. Nothing covers the booking-creation XML (`getPriceQuote`, `createTestBooking`, `verifyBooking`). Browser tests in `tests/e2e` (14 tests) cover the homepage in three locales, the header rooms button on both properties, the booking calendar on the internal test room, the inquiry form, and the admin (login, lists, media library, global search colours). They run against the dev server and the seeded development database; the inquiry test skips itself when SMTP is configured so it can never send real email.
- Running `pnpm dev` adds a `dev` row (batch -1) to `payload_migrations`; `payload migrate` on that database then warns about dev mode. Use a separate empty database to test migrations.
- `PhobsRatePlan.bookUrl` is parsed but unused (the UI builds the link with `phobsBookingLink.ts`).
