#!/usr/bin/env bash
# ClubSphere Production Database Setup & Seed
# Usage:
#   ./scripts/seed-prod.sh "postgresql://user:pass@host:port/dbname"
# Or run with DATABASE_URL set in environment / .env.production

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

if [ -n "$1" ]; then
  npx tsx scripts/seed-production.ts "$1" || ./node_modules/.bin/tsx scripts/seed-production.ts "$1"
else
  npx tsx scripts/seed-production.ts || ./node_modules/.bin/tsx scripts/seed-production.ts
fi

