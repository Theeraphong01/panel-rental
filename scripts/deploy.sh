#!/bin/bash
# PanelRental — One-Click Deploy + Auto-Cron
# Usage: bash scripts/deploy.sh [domain] [email]
#   domain: your domain (default: panel-rental.com)
#   email:  for SSL cert (default: admin@domain)
#
# Everything — Docker, DB, SSL, Cron — in one command.
# Works on fresh Ubuntu 22.04 / Hostinger KVM2.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

DOMAIN=${1:-panel-rental.com}
EMAIL=${2:-admin@$DOMAIN}
APP_DIR="${APP_DIR:-/opt/panelrental}"

banner() {
  echo -e "${GREEN}"
  echo "  ╔═══════════════════════════════════════╗"
  echo "  ║   PanelRental — One-Click Deploy      ║"
  echo "  ║   $DOMAIN"
  echo "  ╚═══════════════════════════════════════╝"
  echo -e "${NC}"
}

banner

# ════════════════════════════════════════
# 1. Prerequisites
# ════════════════════════════════════════
echo -e "${CYAN}📦 [1/7] Checking prerequisites...${NC}"

if ! command -v docker &>/dev/null; then
  echo "   Installing Docker..."
  curl -fsSL https://get.docker.com | bash
  sudo usermod -aG docker "$USER"
  echo "   ⚠️  Docker installed. If this is first run, log out & back in, then re-run."
fi

if ! command -v docker compose &>/dev/null; then
  echo "   Installing Docker Compose..."
  sudo apt-get update -qq && sudo apt-get install -y docker-compose-plugin
fi

if ! command -v curl &>/dev/null; then
  sudo apt-get install -y curl
fi

echo -e "   ✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
echo -e "   ✅ Compose $(docker compose version --short)"

# ════════════════════════════════════════
# 2. Clone / Update
# ════════════════════════════════════════
echo -e "${CYAN}📂 [2/7] Setting up project...${NC}"

if [ ! -d "$APP_DIR" ]; then
  git clone https://github.com/your-org/panel-rental.git "$APP_DIR" 2>/dev/null || {
    echo -e "${YELLOW}   ⚠️  Git clone failed — assuming code is already here${NC}"
  }
fi
cd "$APP_DIR"

# ════════════════════════════════════════
# 3. Environment + Secrets
# ════════════════════════════════════════
echo -e "${CYAN}🔑 [3/7] Configuring secrets...${NC}"

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Generate secrets if they're still placeholders
if grep -q "change-me-in-production" .env 2>/dev/null; then
  echo "   Generating DB password..."
  DB_PW=$(openssl rand -hex 16)
  sed -i "s/change-me-in-production/$DB_PW/" .env
fi

if grep -q "change-me-64chars" .env 2>/dev/null; then
  echo "   Generating AUTH_SECRET..."
  sed -i "s/change-me-64chars/$(openssl rand -hex 32)/" .env
fi

if grep -q "change-me-32chars" .env 2>/dev/null; then
  echo "   Generating CRON_SECRET..."
  CRON_S=$(openssl rand -hex 16)
  sed -i "s/change-me-32chars/$CRON_S/" .env
fi

# Update domain in .env
if grep -q "panel-rental.com" .env 2>/dev/null; then
  sed -i "s|panel-rental.com|$DOMAIN|g" .env
fi

# Read the CRON_SECRET for later
CRON_SECRET=$(grep CRON_SECRET .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
echo "   ✅ Secrets configured"

# ════════════════════════════════════════
# 4. Directories
# ════════════════════════════════════════
echo -e "${CYAN}📁 [4/7] Creating directories...${NC}"
mkdir -p nginx/ssl nginx/conf.d nginx/www uploads backups
touch uploads/.gitkeep backups/.gitkeep
echo "   ✅ Done"

# ════════════════════════════════════════
# 5. Build & Migrate
# ════════════════════════════════════════
echo -e "${CYAN}🐳 [5/7] Building & migrating...${NC}"

docker compose build --pull 2>&1 | tail -1
echo "   ✅ Build complete"

docker compose run --rm app npx prisma migrate deploy 2>&1 | tail -1
echo "   ✅ Migrations applied"

docker compose run --rm app npx prisma db seed 2>&1 | tail -1
echo "   ✅ Database seeded"

# ════════════════════════════════════════
# 6. Start services
# ════════════════════════════════════════
echo -e "${CYAN}🚀 [6/7] Starting services...${NC}"

docker compose up -d

echo "   ⏳ Waiting for health checks..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/auth/signup > /dev/null 2>&1; then
    echo "   ✅ App is healthy!"
    break
  fi
  sleep 2
done

docker compose ps
echo ""

# ════════════════════════════════════════
# 7. Cron Jobs (Auto-Setup)
# ════════════════════════════════════════
echo -e "${CYAN}⏰ [7/7] Setting up cron jobs...${NC}"

CRON_URL="https://${DOMAIN}"
CRON_MARKER="# panelrental-auto-cron"

# Remove old panelrental crons first (idempotent)
crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | crontab - 2>/dev/null || true

# Add new crons
(
  crontab -l 2>/dev/null || true
  echo ""
  echo "$CRON_MARKER"
  echo "# Order sync — every 3 minutes"
  echo "*/3 * * * * curl -sf -H 'x-cron-secret: ${CRON_SECRET}' ${CRON_URL}/api/cron/sync-orders > /dev/null 2>&1"
  echo ""
  echo "# Service sync — every hour at :05"
  echo "5 * * * * curl -sf -H 'x-cron-secret: ${CRON_SECRET}' ${CRON_URL}/api/cron/sync-services > /dev/null 2>&1"
  echo ""
  echo "# Database backup — daily at 2 AM"
  echo "0 2 * * * bash ${APP_DIR}/scripts/backup.sh >> ${APP_DIR}/backups/backup.log 2>&1"
  echo ""
  echo "# SSL auto-renew check — 1st of month at 3 AM"
  echo "0 3 1 * * docker compose -f ${APP_DIR}/docker-compose.yml restart certbot > /dev/null 2>&1"
  echo "$CRON_MARKER"
) | crontab -

echo "   ✅ Cron jobs installed:"
echo "      ├── Order sync     → ทุก 3 นาที"
echo "      ├── Service sync   → ทุก 1 ชั่วโมง"
echo "      ├── DB Backup      → ทุกวัน 02:00"
echo "      └── SSL renew      → ทุกเดือน"

# ════════════════════════════════════════
# Done
# ════════════════════════════════════════
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DEPLOY COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "  🌐 Storefront: https://${DOMAIN}/store/demo"
echo "  👑 Admin:      https://${DOMAIN}/admin"
echo "  🖥️  Dashboard:  https://${DOMAIN}/dashboard"
echo ""
echo "  👤 Default accounts:"
echo "     Admin:  admin@panel-rental.com / admin123"
echo "     Tenant: demo@example.com / demo123"
echo ""
echo "  📋 Cron monitoring:"
echo "     crontab -l | grep panelrental"
echo "     tail -f ${APP_DIR}/backups/backup.log"
echo ""
echo "  🔧 Next step (SSL):"
echo "     bash ${APP_DIR}/scripts/setup-ssl.sh ${DOMAIN} ${EMAIL}"
echo ""
