#!/bin/bash

# Configuration
LOG_FILE="${LOG_FILE:-/var/log/physio-backup.log}"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.gpg>"
    exit 1
fi

BACKUP_FILE="$1"

log "Starting restore process for $BACKUP_FILE..."

# Check required environment variables
if [ -z "$POSTGRES_DB" ]; then
    error_exit "POSTGRES_DB environment variable is not set"
fi
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    error_exit "BACKUP_ENCRYPTION_KEY environment variable is not set"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Decrypt and Restore
log "Decrypting and restoring..."
# Decrypt to stdout and pipe to psql
if echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 --decrypt "$BACKUP_FILE" | PGPASSWORD="$POSTGRES_PASSWORD" psql -h "${POSTGRES_HOST:-localhost}" -U "$POSTGRES_USER" "$POSTGRES_DB"; then
    log "Restore completed successfully"
else
    error_exit "Restore failed"
fi

exit 0
