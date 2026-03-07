#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_HEALTHCHECK_URL="${API_HEALTHCHECK_URL:-http://127.0.0.1:3000/}"

bash "$SCRIPT_DIR/deploy-api.sh"

echo "Waiting API to stabilize..."
sleep 2
curl -fsS "$API_HEALTHCHECK_URL" >/dev/null

bash "$SCRIPT_DIR/deploy-front.sh"

echo "Release complete (API -> Frontend)"
