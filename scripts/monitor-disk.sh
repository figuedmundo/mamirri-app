#!/bin/bash
#
# Disk Space Monitor for MamirriApp
# Monitors disk usage and alerts when thresholds are exceeded
# Run via cron every hour: 0 * * * * /path/to/scripts/monitor-disk.sh
#

set -e

# Configuration
WARNING_THRESHOLD=80
CRITICAL_THRESHOLD=90
EMAIL_ALERT=""  # Set your email here if you want alerts (requires mail/mailx)
SLACK_WEBHOOK=""  # Set Slack webhook URL for Slack alerts
LOG_FILE="/var/log/mamirri/disk-monitor.log"
APP_NAME="MamirriApp"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log to file
    if [ -d "$(dirname "$LOG_FILE")" ]; then
        echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    fi
    
    # Print to terminal with colors
    case $level in
        "INFO")
            echo -e "${GREEN}[$level]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[$level]${NC} $message"
            ;;
        "CRITICAL")
            echo -e "${RED}[$level]${NC} $message"
            ;;
        *)
            echo "[$level] $message"
            ;;
    esac
}

# Function to send email alert
send_email_alert() {
    local subject=$1
    local body=$2
    
    if [ -n "$EMAIL_ALERT" ] && command -v mail &> /dev/null; then
        echo "$body" | mail -s "$subject" "$EMAIL_ALERT"
        log_message "INFO" "Email alert sent to $EMAIL_ALERT"
    fi
}

# Function to send Slack alert
send_slack_alert() {
    local message=$1
    local color=$2
    
    if [ -n "$SLACK_WEBHOOK" ] && command -v curl &> /dev/null; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$APP_NAME Disk Alert\",
                    \"text\": \"$message\",
                    \"footer\": \"Disk Monitor\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK" > /dev/null
        log_message "INFO" "Slack alert sent"
    fi
}

# Function to check disk usage
check_disk_usage() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    local size=$(df -h / | awk 'NR==2 {print $2}')
    local used=$(df -h / | awk 'NR==2 {print $3}')
    local available=$(df -h / | awk 'NR==2 {print $4}')
    local inode_usage=$(df -i / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    echo "usage:$usage|size:$size|used:$used|available:$available|inode:$inode_usage"
}

# Function to get largest directories
get_largest_dirs() {
    echo "$(du -h /var/lib/docker 2>/dev/null | sort -rh | head -5 || echo 'N/A')"
}

# Function to get Docker disk usage
get_docker_usage() {
    if command -v docker &> /dev/null; then
        echo "$(docker system df 2>/dev/null || echo 'Docker not available')"
    else
        echo "Docker not installed"
    fi
}

# Main monitoring logic
main() {
    log_message "INFO" "Starting disk space monitoring"
    
    # Get disk stats
    local disk_stats=$(check_disk_usage)
    local usage=$(echo "$disk_stats" | grep -o 'usage:[0-9]*' | cut -d: -f2)
    local size=$(echo "$disk_stats" | grep -o 'size:[^|]*' | cut -d: -f2)
    local used=$(echo "$disk_stats" | grep -o 'used:[^|]*' | cut -d: -f2)
    local available=$(echo "$disk_stats" | grep -o 'available:[^|]*' | cut -d: -f2)
    local inode_usage=$(echo "$disk_stats" | grep -o 'inode:[0-9]*' | cut -d: -f2)
    
    log_message "INFO" "Disk Usage: ${usage}% (${used}/${size}, ${available} free)"
    log_message "INFO" "Inode Usage: ${inode_usage}%"
    
    # Check for critical threshold
    if [ "$usage" -ge "$CRITICAL_THRESHOLD" ]; then
        local alert_msg="CRITICAL: Disk usage is at ${usage}%!\n"
        alert_msg+="Total: ${size}, Used: ${used}, Available: ${available}\n\n"
        alert_msg+="Large directories:\n$(get_largest_dirs)\n\n"
        alert_msg+="Docker usage:\n$(get_docker_usage)\n\n"
        alert_msg+="Action required: Run cleanup script immediately!"
        
        log_message "CRITICAL" "Disk usage critical: ${usage}%"
        
        # Send alerts
        send_email_alert "$APP_NAME CRITICAL: Disk at ${usage}%" "$alert_msg"
        send_slack_alert "$alert_msg" "danger"
        
        # Auto-run cleanup if critical
        if [ -f "$(dirname "$0")/cleanup-logs.sh" ]; then
            log_message "WARN" "Auto-running cleanup script..."
            "$(dirname "$0")/cleanup-logs.sh" || true
        fi
        
        exit 1
    fi
    
    # Check for warning threshold
    if [ "$usage" -ge "$WARNING_THRESHOLD" ]; then
        local alert_msg="WARNING: Disk usage is at ${usage}% (threshold: ${WARNING_THRESHOLD}%)\n"
        alert_msg+="Total: ${size}, Used: ${used}, Available: ${available}\n\n"
        alert_msg+="Consider running cleanup script soon."
        
        log_message "WARN" "Disk usage warning: ${usage}%"
        
        # Send alerts
        send_email_alert "$APP_NAME WARNING: Disk at ${usage}%" "$alert_msg"
        send_slack_alert "$alert_msg" "warning"
    fi
    
    # Check inode usage (important for Docker)
    if [ "$inode_usage" -ge 90 ]; then
        log_message "WARN" "Inode usage is high: ${inode_usage}%"
        send_slack_alert "WARNING: Inode usage at ${inode_usage}%" "warning"
    fi
    
    # Check container log sizes
    if [ -d "/var/lib/docker/containers" ]; then
        local total_log_size=$(find /var/lib/docker/containers -name "*.log" -type f -exec du -ch {} + 2>/dev/null | grep total$ | cut -f1 || echo "0")
        log_message "INFO" "Total container log size: ${total_log_size}"
        
        # Find containers with large logs (>100MB)
        local large_logs=$(find /var/lib/docker/containers -name "*.log" -type f -size +100M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}' || echo "")
        if [ -n "$large_logs" ]; then
            log_message "WARN" "Containers with large log files (>100MB):"
            echo "$large_logs" | while read line; do
                log_message "WARN" "  $line"
            done
        fi
    fi
    
    log_message "INFO" "Disk monitoring completed successfully"
    exit 0
}

# Run main function
main
