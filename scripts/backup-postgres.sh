#!/bin/bash

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/physio}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
BACKUP_FILENAME="physio-backup-${TIMESTAMP}.sql"
ENCRYPTED_FILENAME="${BACKUP_FILENAME}.gpg"
LOG_FILE="${LOG_FILE:-/var/log/physio-backup.log}"

if [ ! -w "$(dirname "$LOG_FILE")" ] && [ "$EUID" -ne 0 ]; then
    LOG_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/physio"
    mkdir -p "$LOG_DIR"
    LOG_FILE="$LOG_DIR/backup.log"
    echo "Warning: No write permission for /var/log. Logging to $LOG_FILE"
fi

if [ ! -w "$(dirname "$BACKUP_DIR")" ] && [ "$EUID" -ne 0 ]; then
   BACKUP_DIR="${HOME}/backups/physio"
   echo "Warning: No write permission for /var/backups. Saving backups to $BACKUP_DIR"
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

log "Starting backup process..."

# Check required environment variables
if [ -z "$POSTGRES_DB" ]; then
    error_exit "POSTGRES_DB environment variable is not set"
fi
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    error_exit "BACKUP_ENCRYPTION_KEY environment variable is not set"
fi

# Perform backup
log "Dumping database $POSTGRES_DB..."
if ! PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "${POSTGRES_HOST:-localhost}" -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_DIR/$BACKUP_FILENAME"; then
    error_exit "pg_dump failed"
fi

# Encrypt backup
log "Encrypting backup..."
if ! echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 --symmetric --cipher-algo AES256 -o "$BACKUP_DIR/$ENCRYPTED_FILENAME" "$BACKUP_DIR/$BACKUP_FILENAME"; then
    rm -f "$BACKUP_DIR/$BACKUP_FILENAME"
    error_exit "Encryption failed"
fi

# Remove unencrypted file
rm -f "$BACKUP_DIR/$BACKUP_FILENAME"
log "Backup created successfully: $BACKUP_DIR/$ENCRYPTED_FILENAME"

# Retention policy
log "Cleaning up old backups (retention: $BACKUP_RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "physio-backup-*.gpg" -type f -mtime +"$BACKUP_RETENTION_DAYS" -delete
log "Cleanup completed"

log "Backup completed successfully"
exit 0
