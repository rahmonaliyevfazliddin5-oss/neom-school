#!/usr/bin/env bash
# audit/run-all-tests.sh - Script to re-run full test suite & load tests

set -e

echo "============================================================"
echo "[NEOM School] 1. Frontend Typecheck & Lint Audit"
echo "============================================================"
pnpm --filter @neom/web typecheck
pnpm --filter @neom/web lint

echo "============================================================"
echo "[NEOM School] 2. Build Verification"
echo "============================================================"
pnpm --filter @neom/web build

echo "============================================================"
echo "[NEOM School] 3. Playwright E2E & Backend API Audits (40 Tests)"
echo "============================================================"
pnpm --filter @neom/web test:e2e

echo "============================================================"
echo "[NEOM School] 4. Multi-Stage Load Test (50 -> 400 VUs)"
echo "============================================================"
node audit/load-test.js

echo "============================================================"
echo "[NEOM School] ALL TESTS COMPLETED SUCCESSFULLY!"
echo "============================================================"
