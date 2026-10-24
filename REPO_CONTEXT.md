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
- **Revalidation:** `afterChange` hooks revalidate only on published saves. Drafts and live preview go through `/api/draft`.
- **Migrations:** `docker-entrypoint.sh` runs `payload migrate` on container start, so a schema change without a migration breaks production.
- **Git-ignored local files:** `.env`, `todo.txt`, `migrate-output.txt`, `tsconfig.tsbuildinfo`.

## Phobs

`src/lib/phobs.ts` is server-only (credentials). Guests are redirected to the Phobs booking page in production (`phobsBookingLink.ts`).
Direct booking creation works only for one unit on the Phobs test account (`TEST_MODE_UNIT_IDS`, env `PHOBS_TEST_*`). Other units get
`403 not_available_yet` until production has the `PCBookingNew` permission; then remove the test-mode code. `lib/booking.ts` is the fallback to `/inquiry`.

## Known debt

Do not fix as a side effect of another task; propose it first.

- Rate limits live in nginx only (`phobs_read`, `phobs_book`, `inquiry` zones), so local dev is unlimited. If a CDN or load balancer is put in front, add the commented `set_real_ip_from` block in nginx.conf first, or all visitors share one limit.
- `/api/phobs/book` is public; acceptable only while restricted to the test unit.
- **Migrations do not build the full schema.** On an empty database `payload migrate` (what `docker-entrypoint.sh` runs) leaves 69 tables, 66 columns, about 70 enum types and 249 indexes missing compared with what the config needs (search_index, faq_categories, rooms drafts, both homepages, email_settings, ...), and keeps template leftovers (forms, header, footer). The development database got its schema from dev-mode push. A fresh deployment would be broken until a baseline migration is added; measured 2026-10-24.
- Seeds (`/next/seed-*`, `organize-media-folders`) were run on an empty database: they succeed and are idempotent, provided `public/media` is empty. Payload names a new upload `parking-1.svg` when `parking.svg` already exists on disk, so seeding next to an existing media folder duplicates files on every run. They fetch images from medorahotels.com; about 18 of those URLs now return 404, and the 4 sustainability PDFs are rejected because Media only accepts images and video (since 0a4cc0e), so the "We think green" page links to files that do not exist after seeding.
- Tests: Phobs parameter validation, timeout and XML parsing, and the inquiry form (access, honeypot, emails) have integration tests in `tests/int`. Nothing covers the booking-creation XML (`getPriceQuote`, `createTestBooking`, `verifyBooking`) or the pages and admin UI; the two e2e specs are the only browser tests.
- `PhobsRatePlan.bookUrl` is parsed but unused (the UI builds the link with `phobsBookingLink.ts`).
