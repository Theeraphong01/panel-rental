#!/bin/bash
# SSL Setup — run once on the VPS
# Usage: chmod +x scripts/setup-ssl.sh && sudo ./scripts/setup-ssl.sh yourdomain.com

set -e

DOMAIN=${1:-panel-rental.com}
EMAIL=${2:-admin@$DOMAIN}
NGINX_WWW="/var/www/certbot"

echo "🔒 Setting up SSL for $DOMAIN and *.$DOMAIN"

# Create webroot
sudo mkdir -p "$NGINX_WWW"

# Stop any running nginx that might hold port 80
docker compose stop nginx 2>/dev/null || true

# Get certificate (dry-run first to verify)
sudo docker run --rm \
  -v "$(pwd)/certbot_certs:/etc/letsencrypt" \
  -v "$(pwd)/certbot_www:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN" \
  -d "*.$DOMAIN" \
  --preferred-challenges dns 2>/dev/null || \
sudo docker run --rm \
  -v "$(pwd)/certbot_certs:/etc/letsencrypt" \
  -v "$(pwd)/certbot_www:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Copy certs to nginx ssl dir
sudo mkdir -p nginx/ssl
sudo cp -L certbot_certs/live/"$DOMAIN"/fullchain.pem nginx/ssl/ 2>/dev/null || true
sudo cp -L certbot_certs/live/"$DOMAIN"/privkey.pem nginx/ssl/ 2>/dev/null || true

echo "✅ SSL certs obtained for $DOMAIN"
echo "⚠️  Wildcard (*.DOMAIN) requires DNS challenge — add TXT record manually if needed"
echo "   Then run: sudo docker run --rm -v \$(pwd)/certbot_certs:/etc/letsencrypt -v \$(pwd)/certbot_www:/var/www/certbot certbot/certbot certonly --manual --preferred-challenges dns -d '*.$DOMAIN'"
