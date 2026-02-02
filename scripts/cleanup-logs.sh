#!/bin/bash
#
# Log Cleanup Script for MamirriApp
# Run this script daily via cron to cleanup old logs
# Or run manually: ./scripts/cleanup-logs.sh
#

set -e

# Configuration
RETENTION_DAYS=7
DOCKER_LOG_PATH="/var/lib/docker/containers"
BACKUP_LOG_PATH="/var/log/mamirri"
MIN_FREE_SPACE_GB=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (needed for docker logs)
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

print_status "Starting log cleanup at $(date)"

# Get current disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
print_status "Current disk usage: ${DISK_USAGE}%"

# Check if disk usage is critical (>90%)
if [ "$DISK_USAGE" -gt 90 ]; then
    print_warning "CRITICAL: Disk usage is at ${DISK_USAGE}%! Aggressive cleanup recommended."
    RETENTION_DAYS=3
fi

# Cleanup 1: Docker container logs older than retention period
print_status "Step 1: Checking Docker container logs..."
if [ -d "$DOCKER_LOG_PATH" ]; then
    # Find and rotate large log files
    find "$DOCKER_LOG_PATH" -name "*.log" -type f -size +50M -exec sh -c '
        echo "Rotating large log file: {}"
        cat /dev/null > "{}"
    ' \;
    
    # Count current log files
    LOG_COUNT=$(find "$DOCKER_LOG_PATH" -name "*.log" -type f | wc -l)
    print_status "Found ${LOG_COUNT} container log files"
else
    print_warning "Docker log path not found: $DOCKER_LOG_PATH"
fi

# Cleanup 2: Application backup logs
print_status "Step 2: Cleaning application backup logs..."
if [ -d "$BACKUP_LOG_PATH" ]; then
    # Remove log files older than retention days
    DELETED_COUNT=$(find "$BACKUP_LOG_PATH" -name "*.log" -type f -mtime +$RETENTION_DAYS | wc -l)
    find "$BACKUP_LOG_PATH" -name "*.log" -type f -mtime +$RETENTION_DAYS -delete
    print_status "Deleted ${DELETED_COUNT} old log files (>${RETENTION_DAYS} days)"
else
    print_status "Backup log path not found (this is OK for fresh installs): $BACKUP_LOG_PATH"
fi

# Cleanup 3: System journal logs (if using systemd)
print_status "Step 3: Cleaning system journal logs..."
if command -v journalctl &> /dev/null; then
    # Vacuum journal to keep only recent logs
    journalctl --vacuum-time=${RETENTION_DAYS}d --quiet
    JOURNAL_SIZE=$(journalctl --disk-usage 2>/dev/null | awk '{print $7}' || echo "unknown")
    print_status "Journal logs vacuumed. Current size: ${JOURNAL_SIZE}"
fi

# Cleanup 4: Docker system prune (removes unused data)
print_status "Step 4: Running Docker system prune..."
if command -v docker &> /dev/null; then
    # Only prune if disk usage is high
    if [ "$DISK_USAGE" -gt 80 ]; then
        print_warning "Disk usage is high, pruning unused Docker data..."
        docker system prune -f --volumes 2>/dev/null || true
        print_status "Docker prune completed"
    else
        print_status "Skipping Docker prune (disk usage acceptable)"
    fi
fi

# Final disk usage check
FINAL_DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
FREED_SPACE=$((DISK_USAGE - FINAL_DISK_USAGE))

print_status "Cleanup completed at $(date)"
print_status "Disk usage: ${DISK_USAGE}% → ${FINAL_DISK_USAGE}%"
if [ "$FREED_SPACE" -gt 0 ]; then
    print_status "Freed approximately ${FREED_SPACE}% disk space"
fi

# Alert if disk is still critical
if [ "$FINAL_DISK_USAGE" -gt 90 ]; then
    print_error "WARNING: Disk usage still critical at ${FINAL_DISK_USAGE}%!"
    print_error "Consider: 1) Increasing disk size 2) Reducing log retention 3) Investigating large files"
    exit 1
fi

# Check minimum free space
FREE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$FREE_GB" -lt "$MIN_FREE_SPACE_GB" ]; then
    print_warning "Free space is low: ${FREE_GB}GB (minimum recommended: ${MIN_FREE_SPACE_GB}GB)"
fi

print_status "Log cleanup completed successfully!"
exit 0
