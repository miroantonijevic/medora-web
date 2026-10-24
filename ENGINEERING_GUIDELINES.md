# Engineering guidelines

REPO_CONTEXT.md says what this system is. This file says how to change it. Apply it to every change, however small.

## 1. Understand before you change

- Read the code around the change, and every place that already solves a similar problem. A new piece must look like it was always
  there: same structure, naming, error handling, tests. Consistency beats personal preference.
- Next.js here has breaking changes against common knowledge. Read the relevant guide in `node_modules/next/dist/docs/` before writing
  Next.js code, and heed deprecation notices. Payload APIs: check the installed version (3.84.x), not memory.
- Find the cause. A fix that hides the symptom is a new bug in waiting. If you cannot explain why it was broken, you have not fixed it.
- If the request is ambiguous or the right design is not obvious, ask. A short question is cheaper than a wrong implementation.

## 2. Design

- **Simple first.** The smallest design that is correct and clear. No options, layers or abstractions for needs that do not exist yet.
- **One place for each thing.** Every rule, text, default and algorithm has a single source of truth. Duplication is the main source
  of drift. If you meet duplicated logic, or are about to create it, stop and say so (see section 5).
  Examples that matter here: property slugs and ids come from the database, not from literals in code; UI strings live in
  `src/messages/{en,hr,de}.json`, and every key is added to all three files in the same change.
- **High cohesion, low coupling.** Dependencies point one way: routes and pages call `src/lib` (queries, Phobs client), `src/lib` calls
  Payload. Never the reverse. Payload hooks may call `src/lib` helpers but must not import page or component code.
- **Server and client boundary.** `src/lib/phobs.ts` and anything reading Phobs credentials, SMTP settings or `PAYLOAD_SECRET` is
  server-only. The browser talks to our `/api/*` routes and never to Phobs. Only `NEXT_PUBLIC_*` values may reach client code, and
  only non-secret ones.
- **Configuration over code** for anything that differs between deployments or that an editor may want to tune: environment variable
  (documented in `.env.example`) for deployment, CMS global or field for editorial content. A setting has one defined default, and
  what the editor sees must match what the site does.
- **Validate at the boundary.** Check input where it enters (API route bodies, search params, env vars, Phobs XML), then trust it
  inside. Parse external responses defensively; an unexpected Phobs response must fail with a logged, specific error.
- **Fail safe.** A new optional setting or field must not change anything until it is set. Old data must keep working. Schema changes
  are additive, with a migration (see section 4); removals come with a data path.
- **Authorization lives on the server.** Hiding things in the admin UI is a convenience. Real checks are Payload `access` functions
  (`src/access`) and API route checks, with the least privilege that works. Public create (inquiries) stays narrow.
- **Bound everything.** Every query has a `limit`, a sensible `depth` and `select` where possible; every external call (Phobs, SMTP)
  has a timeout; every public endpoint has limits on payload size and values, and rate limiting where it can cost money or write data.
- **Locales.** en, hr and de are all first-class. Localized fields, routes and messages must work in all three; do not add behaviour
  that only works for the default locale.

## 3. Implementation

- Names say what a thing is, not how it is made. Rename when the meaning changes.
- TypeScript: no `any` and no `@ts-expect-error` shortcuts to silence a real type problem. Use the generated `payload-types.ts`;
  never edit it by hand.
- Errors are never swallowed silently. Handle what you can, log what you handled, let the rest fail loudly. Degrade gracefully only
  where a user is waiting (for example fall back to the inquiry link when booking is unavailable), and say so in the log.
- Log decisions, not noise. Never log secrets, tokens or guest personal data.
- Comments explain why, never what. No dead code, no commented-out code, no unused imports, parameters or settings. Delete what a
  change makes unused. Temporary test-mode code (such as `TEST_MODE_UNIT_IDS`) carries a comment stating when it is removed.
- Do not mix concerns in one change: a behaviour change, a refactoring and a formatting pass are three changes.

## 4. Verification

- New behaviour and every bug fix come with a test that goes through the real path (real Payload local API against a test database,
  real rendering), not only through mocks of the thing being tested. A test must be able to fail for the right reason.
  Pure parsing logic (for example Phobs XML) gets unit tests with real sample responses.
- Before calling something done, run and read the output of:
  - `pnpm test:int` (and `pnpm test:e2e` when pages or flows changed)
  - `pnpm exec tsc --noEmit`
  - `pnpm exec eslint` on the touched files
  - `pnpm build` for changes to routing, config or server/client boundaries
  - Interface changes: run in a real browser, on each affected locale, and for admin changes in the admin panel.
- Schema changes (collections, globals, blocks, fields): run `pnpm generate:types`, create a migration with
  `pnpm payload migrate:create`, review the SQL, and run `pnpm payload migrate` locally. The container applies migrations on start,
  so a missing migration breaks production. New or moved admin components need `pnpm generate:importmap`.
- Say precisely what was verified and what was not. Never claim success from a tool's report alone: read the result.
- Update REPO_CONTEXT.md in the same change, or it is wrong the next day.

## 5. Refactoring and generalizing

- When you see the same logic in several places, or an implementation that would be simpler or more correct elsewhere, **say so and
  propose it**: where it is, what the single place would be, what changes, the risk. Do not do it on your own initiative, and do not
  copy the pattern again to avoid the conversation.
- **Ask before any refactoring** that goes beyond the task, and wait for an answer.
- When approved: keep behaviour identical, have tests green before and after, change in small steps, and commit it separately from any
  behaviour change.
- Generalize when the shared part is real (the same reason to change), not merely similar text. Two similar things are not yet a
  pattern; the wrong abstraction costs more than duplication.

## 6. Working with people and production

- For anything bigger than a small fix, say what will change and where, and wait for a go before implementing. Refining the design is
  not a go.
- Do not widen the scope. Report what you noticed outside it instead of fixing it silently.
- Commit, push and deploy only when asked. Stage only your own files by path: the working tree may hold someone else's unfinished work
  (check `git status` first). Never commit `.env` or other secrets.
- Never write to the production database or change production by hand. Reads are SELECT only, bounded, and asked for first. Seed
  endpoints (`/next/seed-*`) and `republish-pages` write data: run them against local or test databases only, unless explicitly told otherwise.
- Phobs: production has no booking-creation permission. Never call booking creation against production units, and never create test
  bookings without saying so.
- Be direct: answer the question that was asked, state the source of every fact, and say what you do not know.
