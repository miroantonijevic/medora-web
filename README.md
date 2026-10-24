# Medora Web

Website and CMS for Medora Hotels: **Medora Auri Family Beach Resort** and **Luxury Camp Orbis**.
A Next.js site with the Payload CMS built into the same app, in English, Croatian and German, with
availability and rates from the Phobs PMS.

- Public site: `/{locale}/...` (`en`, `hr`, `de`)
- Admin panel: `/admin`
- Stack: Next.js 16, Payload 3, PostgreSQL 17, Tailwind 4, `next-intl`

For how the system fits together read [REPO_CONTEXT.md](REPO_CONTEXT.md). For how to change it read
[ENGINEERING_GUIDELINES.md](ENGINEERING_GUIDELINES.md).

## Getting started

Requirements: Node 24, pnpm 9 or 10, Docker (for PostgreSQL).

```bash
cp .env.example .env          # then fill in the secrets, see below
docker compose up -d postgres # PostgreSQL on localhost:5432
pnpm install
pnpm dev                      # http://localhost:3000
```

Open `/admin` and create the first user with the `admin` role. New users default to `editor`, which cannot
open the admin panel (only `admin` can, see `src/access/isAdmin.ts`).

### Environment

All variables are documented in [.env.example](.env.example). The ones you need to run locally:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection |
| `PAYLOAD_SECRET` | Payload secret; also derives the key that encrypts the SMTP password |
| `PAYLOAD_DRAFT_SECRET`, `PREVIEW_SECRET` | Draft and live preview links (`/api/draft`, `/next/preview`) |
| `REVALIDATE_SECRET`, `CRON_SECRET` | Revalidation webhook and scheduled jobs |
| `NEXT_PUBLIC_SERVER_URL` | Public URL of the site |
| `PHOBS_*`, `PHOBS_TEST_*` | Phobs credentials, server-side only; optional locally (without them the booking calendar shows an error) |

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm test:int` | Integration tests (Vitest, uses the local database) |
| `pnpm test:e2e` | Browser tests (Playwright). They start `pnpm dev` and need the seeded development database; they create and remove a throwaway admin user and an inquiry. If they fail with 500 after you edited code, restart the dev server. |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing a collection, global or block |
| `pnpm generate:importmap` | Regenerate the admin import map after adding or moving admin components |
| `pnpm payload migrate:create` | Create a migration after a schema change |
| `pnpm payload migrate` | Apply migrations |

A schema change without a migration breaks production: the container runs `payload migrate` on start.

## Seeding content

The `/next/seed-*` endpoints fill a fresh database with pages, rooms, offers, FAQ and homepages. They write
data, require `?secret=<PAYLOAD_SECRET>` and are meant for local or test databases only. `/next/reindex-search`
rebuilds the admin search index.

## Deployment

`docker-compose.yml` runs PostgreSQL, the app and nginx (profiles `fullstack` and `certbot` for the last two).

```bash
docker compose --profile fullstack up -d --build
```

The image builds without a database. On start the container applies migrations, and `/api/health` reports
ready once the database answers; nginx waits for it.

nginx terminates TLS, caches static assets and rate-limits the preview, revalidation, Phobs and inquiry
endpoints. If a CDN or load balancer is placed in front of it, configure `real_ip` in
[nginx.conf](nginx.conf) first, otherwise all visitors share one rate limit.

Uploaded media lives in the `uploads_data` volume.
