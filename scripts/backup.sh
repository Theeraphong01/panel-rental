#!/bin/bash
# Database Backup Script
# Schedule: 0 2 * * * /app/scripts/backup.sh
# Keeps: daily (7), weekly (4), monthly (3)

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/panelrental}"
DB_NAME="${DB_NAME:-panelrental}"
DB_USER="${DB_USER:-panelrental}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAILY=${RETENTION_DAILY:-7}
RETENTION_WEEKLY=${RETENTION_WEEKLY:-4}
RETENTION_MONTHLY=${RETENTION_MONTHLY:-3}

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DAY=$(date +%d)
DOW=$(date +%u)  # 1=Monday

mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly" "$BACKUP_DIR/monthly"

# Dump
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-acl -Fc \
  > "$BACKUP_DIR/daily/${TIMESTAMP}.dump"

# Compress
gzip -f "$BACKUP_DIR/daily/${TIMESTAMP}.dump"

echo "[$(date)] Backup created: ${TIMESTAMP}.dump.gz"

# ── Rotation ──
# Daily: keep last N
find "$BACKUP_DIR/daily" -name "*.dump.gz" -mtime +${RETENTION_DAILY} -delete

# Weekly (Sunday): keep last N
if [ "$DOW" = "7" ]; then
  cp "$BACKUP_DIR/daily/${TIMESTAMP}.dump.gz" "$BACKUP_DIR/weekly/"
  find "$BACKUP_DIR/weekly" -name "*.dump.gz" -mtime +$((RETENTION_WEEKLY * 7)) -delete
fi

# Monthly (1st of month): keep last N
if [ "$DAY" = "01" ]; then
  cp "$BACKUP_DIR/daily/${TIMESTAMP}.dump.gz" "$BACKUP_DIR/monthly/"
  find "$BACKUP_DIR/monthly" -name "*.dump.gz" -mtime +$((RETENTION_MONTHLY * 30)) -delete
fi

# ── Offsite copy (optional) ──
# rclone copy "$BACKUP_DIR" remote:panelrental-backups/

echo "[$(date)] Backup rotation complete"
