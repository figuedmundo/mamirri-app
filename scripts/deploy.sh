#!/bin/bash

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="${LOG_FILE:-/var/log/physio-deploy.log}"

# Check write permissions for log file
if [ ! -w "$(dirname "$LOG_FILE")" ] && [ "$EUID" -ne 0 ]; then
    LOG_FILE="./physio-deploy.log"
    echo "Warning: No write permission for /var/log. Logging to $LOG_FILE"
fi

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check for dry-run flag
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    log "Running in DRY-RUN mode"
fi

# Function to execute command or print if dry-run
run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would run: $*"
    else
        log "Running: $*"
        "$@"
        local status=$?
        if [ $status -ne 0 ]; then
            error_exit "Command failed: $*"
        fi
    fi
}

log "Starting deployment..."

# Check requirements
if [ ! -f "$COMPOSE_FILE" ]; then
    error_exit "$COMPOSE_FILE not found!"
fi

# Stop containers
run_cmd docker compose -f "$COMPOSE_FILE" down

# Pull latest images (or build if using build context)
if grep -q "build:" "$COMPOSE_FILE"; then
    log "Building images..."
    run_cmd docker compose -f "$COMPOSE_FILE" build
else
    log "Pulling images..."
    run_cmd docker compose -f "$COMPOSE_FILE" pull
fi

# Start containers
run_cmd docker compose -f "$COMPOSE_FILE" up -d

# Wait for health checks
log "Waiting for services to become healthy..."
if [ "$DRY_RUN" = false ]; then
    # Wait up to 60 seconds for services to report healthy
    ATTEMPTS=0
    MAX_ATTEMPTS=12 # 12 * 5s = 60s
    while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        sleep 5
        # Check if any container is unhealthy
        if docker compose -f "$COMPOSE_FILE" ps | grep -q "unhealthy"; then
            error_exit "One or more services reported as unhealthy!"
        fi
        
        # Check if server and client are specifically healthy
        SERVER_STATE=$(docker inspect --format='{{.State.Health.Status}}' physio_server 2>/dev/null)
        CLIENT_STATE=$(docker inspect --format='{{.State.Health.Status}}' physio_client 2>/dev/null)
        
        if [ "$SERVER_STATE" = "healthy" ] && [ "$CLIENT_STATE" = "healthy" ]; then
            log "All critical services (server, client) are healthy!"
            break
        fi
        
        log "Waiting for health checks... (Attempt $((ATTEMPTS+1))/$MAX_ATTEMPTS) [Server: ${SERVER_STATE:-unknown}, Client: ${CLIENT_STATE:-unknown}]"
        ATTEMPTS=$((ATTEMPTS+1))
    done

    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        error_exit "Timeout waiting for services to become healthy"
    fi
fi

log "Deployment completed successfully"
exit 0
