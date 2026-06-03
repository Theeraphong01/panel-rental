# PanelRental — Deploy Documentation

## 🔧 Prerequisites (VPS)

- Ubuntu 22.04 LTS (Hostinger KVM2 works)
- Docker + Docker Compose
- Domain with DNS pointing to VPS IP
- Ports 80/443 open

## 🚀 Quick Start

### One Command (Auto-Everything)

```bash
git clone <repo-url> /opt/panelrental && cd /opt/panelrental
bash scripts/deploy.sh panel-rental.com admin@panel-rental.com
```

That's it. The script auto-installs:
- Docker + Compose
- Database (PostgreSQL)
- App (Next.js standalone)
- Nginx reverse proxy
- Secrets (auto-generated)
- Migrations + seed data
- **Cron jobs** (order sync, service sync, backup, SSL renew)

⏱️ ~2-3 minutes from zero to live.

### Manual (if needed)

## 📂 Directory Structure

```
/opt/panelrental/
├── docker-compose.yml
├── Dockerfile
├── .env
├── nginx/
│   └── nginx.conf
├── scripts/
│   ├── deploy.sh        # One-click deploy
│   ├── setup-ssl.sh     # SSL setup
│   └── backup.sh        # DB backup
├── backups/             # pg_dump files
├── uploads/             # User uploads (slips, logos)
└── certbot_*/           # Let's Encrypt
```

## 🔐 Security

| Layer | Config |
|-------|--------|
| Nginx Rate Limit | API: 10r/s, Auth: 3r/s, Storefront: 30r/s |
| CSP Headers | `default-src 'self'` |
| SSL | TLS 1.2+, Let's Encrypt auto-renew |
| DB | Behind Docker network, no public port |
| Backups | Daily + weekly + monthly rotation |

## 📊 Monitoring

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f app
docker compose logs -f nginx

# Resource usage
docker stats

# DB connection
docker compose exec db psql -U panelrental -d panelrental
```

## 🔄 Updates

```bash
git pull
docker compose build app
docker compose up -d app
docker compose run --rm app npx prisma migrate deploy
```

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| **502 Bad Gateway** | `docker compose restart app` |
| **DB connection refused** | `docker compose restart db` |
| **SSL expired** | `./scripts/setup-ssl.sh` |
| **Migration failed** | `docker compose run --rm app npx prisma migrate status` |
| **Port already in use** | `sudo lsof -i :80` and stop conflicting service |

## 🏷️ Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@panel-rental.com | admin123 |
| Demo Tenant | demo@example.com | demo123 |
