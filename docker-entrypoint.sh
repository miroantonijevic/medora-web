#!/bin/sh
set -e

echo "[entrypoint] Running Payload database migrations..."
# node_modules/.bin/payload is a shell shim, so run the CLI entry file directly.
node --import tsx/esm node_modules/payload/bin.js migrate

echo "[entrypoint] Migrations complete. Starting Next.js server..."
exec node server.js
