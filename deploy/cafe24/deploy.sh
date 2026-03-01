#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/cpu}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-cpu.it.kr}"

if ! command -v git >/dev/null 2>&1; then
  sudo apt update
  sudo apt install -y git
fi

if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  if [ -z "$REPO_URL" ]; then
    echo "REPO_URL is required when APP_DIR does not exist."
    echo "Example: REPO_URL=https://github.com/your-org/your-repo.git bash deploy/cafe24/deploy.sh"
    exit 1
  fi
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi

npm ci
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

pm2 start ecosystem.config.cjs --update-env || pm2 restart cpu-api --update-env
pm2 save

if ! command -v nginx >/dev/null 2>&1; then
  sudo apt update
  sudo apt install -y nginx
fi

if [ -f "deploy/nginx/cpu.it.kr.conf" ]; then
  sudo cp deploy/nginx/cpu.it.kr.conf "/etc/nginx/sites-available/$DOMAIN"
elif [ -f "deploy/nginx/stu11.emirim.kr.conf" ]; then
  sudo cp deploy/nginx/stu11.emirim.kr.conf "/etc/nginx/sites-available/$DOMAIN"
fi

if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
  if ! grep -q "server_name $DOMAIN;" "/etc/nginx/sites-available/$DOMAIN"; then
    sudo sed -i "s/server_name .*/server_name $DOMAIN;/" "/etc/nginx/sites-available/$DOMAIN"
  fi
  if [ ! -e "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    sudo ln -s "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
  fi
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "Deployment complete"
pm2 status
echo "API test: curl http://172.235.192.201/question"
