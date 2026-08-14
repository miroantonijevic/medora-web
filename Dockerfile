# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:24-alpine AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_OPTIONS=--no-deprecation
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Payload types + importmap, then build Next.js standalone
RUN pnpm payload generate:types && \
    pnpm payload generate:importmap && \
    pnpm build

# ============================================================
# Stage 3: Production runner
# ============================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--no-deprecation
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# node_modules from deps stage — needed by Payload CLI for `payload migrate`
COPY --from=deps /app/node_modules ./node_modules

# Standalone Next.js server (includes its own minimal node_modules internally)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Drizzle migration files (committed, applied at container startup)
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations

# Source + config required by `payload migrate` CLI (needs TS resolution via tsx)
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/payload.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Media upload directory — bind-mounted from Docker named volume in production
RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

# Entrypoint: run migrations then start server
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
