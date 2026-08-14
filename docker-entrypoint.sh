#!/bin/sh
set -e

echo "[entrypoint] Running Payload database migrations..."
node --import tsx/esm node_modules/.bin/payload migrate

echo "[entrypoint] Migrations complete. Starting Next.js server..."
exec node server.js
