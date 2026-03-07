#!/usr/bin/env bash
set -euo pipefail

API_DIR="${API_DIR:-$HOME/cpu-api}"
API_REPO_URL="${API_REPO_URL:-}"
API_BRANCH="${API_BRANCH:-main}"
PM2_APP_NAME="${PM2_APP_NAME:-cpu-api}"
PM2_ECOSYSTEM_FILE="${PM2_ECOSYSTEM_FILE:-ecosystem.config.cjs}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/}"

ensure_git() {
  if ! command -v git >/dev/null 2>&1; then
    sudo apt update
    sudo apt install -y git
  fi
}

ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
  fi
}

sync_api_repo() {
  if [ -d "$API_DIR/.git" ]; then
    cd "$API_DIR"
    git fetch origin "$API_BRANCH"
    git checkout "$API_BRANCH"
    git pull origin "$API_BRANCH"
  else
    if [ -z "$API_REPO_URL" ]; then
      echo "API_REPO_URL is required when API_DIR does not exist."
      echo "Example: API_REPO_URL=https://github.com/your-org/your-api-repo.git bash deploy/cafe24/deploy-api.sh"
      exit 1
    fi

    git clone --branch "$API_BRANCH" "$API_REPO_URL" "$API_DIR"
    cd "$API_DIR"
  fi
}

build_api() {
  npm ci
  npm run build
}

restart_api() {
  if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
  fi

  pm2 start "$PM2_ECOSYSTEM_FILE" --update-env || pm2 restart "$PM2_APP_NAME" --update-env
  pm2 save
}

healthcheck_api() {
  echo "Healthcheck: $HEALTHCHECK_URL"
  curl -fsS "$HEALTHCHECK_URL" >/dev/null
  echo "API is healthy"
}

ensure_git
ensure_node
sync_api_repo
build_api
restart_api
healthcheck_api

echo "API deployment complete"
