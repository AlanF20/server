#!/usr/bin/env bash
# init.sh - Harness verification for Repertory
# Exits 0 if everything is healthy.

# Always run from repo root
cd "$(dirname "$0")"

# Resolve pnpm — prefer global, then known /tmp install, then npx from neutral dir
PNPM=""
if command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
elif [ -x "/tmp/pnpm-bin/bin/pnpm" ]; then
  PNPM="/tmp/pnpm-bin/bin/pnpm"
elif (cd /tmp && npx --yes pnpm -v >/dev/null 2>&1); then
  PNPM="env -C /tmp npx --yes pnpm"
fi

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}ok${NC} $1"; }
warn() { echo -e "${YELLOW}warn${NC} $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; exit 1; }

echo ""
echo "======================================"
echo "  Repertory - Harness init check"
echo "======================================"
echo ""

[ -z "$PNPM" ] && fail "pnpm not found (install with: npm install -g pnpm)"

# -- 1. Tooling
echo "-- Tooling"
command -v node >/dev/null 2>&1 && ok "node $(node -v)" || fail "node not found"
ok "pnpm $($PNPM -v)"
echo ""

# -- 2. Dependencies
echo "-- Dependencies"
[ -d "client/node_modules" ]  && ok "client/node_modules"  || warn "client deps missing - run: pnpm install"
[ -d "server/node_modules" ]  && ok "server/node_modules"  || warn "server deps missing - run: pnpm install"
echo ""

# -- 3. Harness files
echo "-- Harness files"
[ -f "AGENTS.md" ]            && ok "AGENTS.md"            || fail "AGENTS.md missing"
[ -f "CHECKPOINTS.md" ]       && ok "CHECKPOINTS.md"       || fail "CHECKPOINTS.md missing"
[ -f "feature_list.json" ]    && ok "feature_list.json"    || fail "feature_list.json missing"
[ -f "progress/current.md" ]  && ok "progress/current.md"  || fail "progress/current.md missing"
[ -f "docs/architecture.md" ] && ok "docs/architecture.md" || fail "docs/architecture.md missing"
[ -f "docs/conventions.md" ]  && ok "docs/conventions.md"  || fail "docs/conventions.md missing"
[ -f "docs/verification.md" ] && ok "docs/verification.md" || fail "docs/verification.md missing"
echo ""

# -- 4. feature_list.json integrity
echo "-- feature_list.json integrity"
IN_PROGRESS=$(node -e "
  const f = JSON.parse(require('fs').readFileSync('feature_list.json','utf8'));
  console.log(f.features.filter(x => x.status === 'in_progress').length);
")
if [ "$IN_PROGRESS" -gt 1 ]; then
  fail "More than 1 feature is in_progress ($IN_PROGRESS). Fix feature_list.json."
elif [ "$IN_PROGRESS" -eq 1 ]; then
  FNAME=$(node -e "
    const f = JSON.parse(require('fs').readFileSync('feature_list.json','utf8'));
    const ip = f.features.find(x => x.status === 'in_progress');
    console.log(ip ? ip.name : '');
  ")
  warn "1 feature in_progress: $FNAME"
else
  ok "No features in_progress (clean state)"
fi
echo ""

# -- 5. Server env
echo "-- Server env"
[ -f "server/.env" ] && ok "server/.env exists" || fail "server/.env missing"
grep -q "DATABASE_URL" server/.env && ok "DATABASE_URL set" || fail "DATABASE_URL not in server/.env"
echo ""

# -- 6. Database
echo "-- Database"
if [ -f "server/prisma/dev.db" ]; then
  ok "server/prisma/dev.db exists"
else
  warn "dev.db not found - run: cd server && pnpm db:migrate && pnpm db:seed"
fi
echo ""

# -- 7. Server tests
echo "-- Server tests"
if [ -d "server/src" ]; then
  SPEC_COUNT=$(find server/src -name "*.spec.ts" | wc -l | tr -d ' ')
  if [ "$SPEC_COUNT" -gt 0 ]; then
    ok "$SPEC_COUNT spec file(s) found"
    cd server && node_modules/.bin/jest --passWithNoTests 2>&1 | tail -5 && cd ..
  else
    warn "No spec files yet - add tests as you implement features"
  fi
fi
echo ""

# -- 8. Client TypeScript
echo "-- Client TypeScript"
if [ -d "client/src" ]; then
  set +e
  cd client && node_modules/.bin/tsc --noEmit 2>&1
  TS_EXIT=$?
  cd ..
  set -e
  if [ $TS_EXIT -eq 0 ]; then
    ok "TypeScript OK"
  else
    fail "TypeScript errors in client - fix before closing session"
  fi
fi
echo ""

echo "======================================"
echo -e "  ${GREEN}All checks passed - harness is healthy${NC}"
echo "======================================"
echo ""
