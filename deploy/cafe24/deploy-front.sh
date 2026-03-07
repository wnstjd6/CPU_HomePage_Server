#!/usr/bin/env bash
set -euo pipefail

FRONT_DIR="${FRONT_DIR:-$HOME/cpu-front}"
FRONT_REPO_URL="${FRONT_REPO_URL:-}"
FRONT_BRANCH="${FRONT_BRANCH:-main}"
FRONT_DIST_DIR="${FRONT_DIST_DIR:-/var/www/cpu-front}"
NGINX_SITE="${NGINX_SITE:-cpu.it.kr}"

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

sync_front_repo() {
  if [ -d "$FRONT_DIR/.git" ]; then
    cd "$FRONT_DIR"
    git fetch origin "$FRONT_BRANCH"
    git checkout "$FRONT_BRANCH"
    git pull origin "$FRONT_BRANCH"
  else
    if [ -z "$FRONT_REPO_URL" ]; then
      echo "FRONT_REPO_URL is required when FRONT_DIR does not exist."
      echo "Example: FRONT_REPO_URL=https://github.com/your-org/your-front-repo.git bash deploy/cafe24/deploy-front.sh"
      exit 1
    fi

    git clone --branch "$FRONT_BRANCH" "$FRONT_REPO_URL" "$FRONT_DIR"
    cd "$FRONT_DIR"
  fi
}

build_front() {
  npm ci
  npm run build
}

deploy_dist() {
  sudo mkdir -p "$FRONT_DIST_DIR"
  sudo rm -rf "$FRONT_DIST_DIR"/*
  sudo cp -r dist/* "$FRONT_DIST_DIR"/
  sudo chown -R www-data:www-data "$FRONT_DIST_DIR"
}

reload_nginx() {
  if ! command -v nginx >/dev/null 2>&1; then
    sudo apt update
    sudo apt install -y nginx
  fi

  if [ -f "/etc/nginx/sites-available/$NGINX_SITE" ]; then
    sudo nginx -t
    sudo systemctl reload nginx
  else
    echo "Nginx site not found: /etc/nginx/sites-available/$NGINX_SITE"
    echo "Skipped nginx reload"
  fi
}

ensure_git
ensure_node
sync_front_repo
build_front
deploy_dist
reload_nginx

echo "Frontend deployment complete"
