#!/bin/bash

# Production Deployment Script
# Optimized for reliability and performance

# IMPORTANT: Log file setup must happen BEFORE set -euo pipefail
# and BEFORE any logging functions are defined

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="${LOG_FILE:-/var/log/physio-deploy.log}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MAX_HEALTH_WAIT="${MAX_HEALTH_WAIT:-120}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"

# Docker timeout settings (prevent indefinite hangs)
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_CLIENT_TIMEOUT=300

# Setup log file with fallback (MUST be first)
setup_logging() {
    # Try to use the specified log file
    if [ -n "$LOG_FILE" ]; then
        local log_dir
        log_dir=$(dirname "$LOG_FILE")
        
        # Check if directory exists and is writable, or can be created
        if [ -d "$log_dir" ] && [ -w "$log_dir" ]; then
            # Directory exists and is writable - try to create/write the file
            if touch "$LOG_FILE" 2>/dev/null && [ -w "$LOG_FILE" ]; then
                # Success - we can use this log file
                return 0
            fi
        fi
    fi
    
    # Fallback to local log file
    LOG_FILE="./physio-deploy.log"
    echo "Warning: Cannot write to default log file. Using: $LOG_FILE" >&2
    
    # Create the fallback file
    touch "$LOG_FILE" 2>/dev/null || {
        # Last resort - use no log file, just stdout
        LOG_FILE="/dev/null"
        echo "Warning: Cannot create log file. Logging to stdout only." >&2
    }
}

# Setup logging immediately
setup_logging

# Now enable strict mode
set -euo pipefail

# Colors for output (disabled if not TTY)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED='' GREEN='' YELLOW='' BLUE='' NC=''
fi

# Logging functions - output to both screen AND log file
log() {
    local msg="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    if [ -w "$LOG_FILE" ] 2>/dev/null; then
        echo -e "${BLUE}[INFO]${NC} $msg" | tee -a "$LOG_FILE"
    else
        echo -e "${BLUE}[INFO]${NC} $msg"
    fi
}

success() {
    local msg="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    if [ -w "$LOG_FILE" ] 2>/dev/null; then
        echo -e "${GREEN}[SUCCESS]${NC} $msg" | tee -a "$LOG_FILE"
    else
        echo -e "${GREEN}[SUCCESS]${NC} $msg"
    fi
}

warn() {
    local msg="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    if [ -w "$LOG_FILE" ] 2>/dev/null; then
        echo -e "${YELLOW}[WARN]${NC} $msg" | tee -a "$LOG_FILE"
    else
        echo -e "${YELLOW}[WARN]${NC} $msg"
    fi
}

error_exit() {
    local msg="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo -e "${RED}[ERROR]${NC} $msg" >&2
    if [ -w "$LOG_FILE" ] 2>/dev/null; then
        echo "$msg" >> "$LOG_FILE"
    fi
    
    # Show container logs on failure for debugging
    if command -v docker >/dev/null 2>&1; then
        echo -e "\n${RED}Container status:${NC}" >&2
        docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || true
        
        echo -e "\n${RED}Recent logs from failing containers:${NC}" >&2
        docker compose -f "$COMPOSE_FILE" logs --tail=50 2>/dev/null || true
    fi
    
    exit 1
}

# Check for command line flags
DRY_RUN=false
SKIP_BACKUP=false
TEST_BUILD_ONLY=false
USE_BUILDKIT=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --test-build)
            TEST_BUILD_ONLY=true
            shift
            ;;
        --legacy)
            USE_BUILDKIT=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Preview changes without applying them"
            echo "  --skip-backup   Skip database backup (not recommended)"
            echo "  --test-build    Only build images, don't deploy (test build only)"
            echo "  --legacy        Use legacy Docker builder (avoids BuildKit hangs on some servers)"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  LOG_FILE        Log file path (default: /var/log/physio-deploy.log)"
            echo "  BACKUP_DIR      Backup directory (default: ./backups)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1. Use --help for usage information." >&2
            exit 1
            ;;
    esac
done

# Now we can safely use logging functions
log "Log file: $LOG_FILE"

if [ "$DRY_RUN" = true ]; then
    log "Running in DRY-RUN mode"
fi

if [ "$SKIP_BACKUP" = true ]; then
    log "Skipping backup (use with caution!)"
fi

if [ "$TEST_BUILD_ONLY" = true ]; then
    log "Test-build mode: Only building images, no deployment"
fi

# Function to execute command or print if dry-run
run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would run: $*"
    else
        log "Running: $*"
        if ! "$@"; then
            error_exit "Command failed: $*"
        fi
        log "Command completed successfully"
    fi
}

# Pre-deployment checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root (not recommended)
    if [ "$EUID" -eq 0 ]; then
        warn "Running as root is not recommended for security reasons"
    fi
    
    # Check Docker and Docker Compose
    if ! command -v docker >/dev/null 2>&1; then
        error_exit "Docker is not installed or not in PATH"
    fi
    
    if ! docker compose version >/dev/null 2>&1; then
        error_exit "Docker Compose plugin not found"
    fi
    
    # Check compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        error_exit "$COMPOSE_FILE not found in $(pwd)"
    fi
    
    # Check .env file exists
    if [ ! -f ".env" ]; then
        warn ".env file not found. Ensure all environment variables are set."
    fi

    # Ensure backup directory exists with correct permissions
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        chmod 755 "$BACKUP_DIR"
    fi
    
    # Check available disk space (need at least 2GB)
    if [ "$DRY_RUN" = false ]; then
        # Cross-platform disk space check (works on Linux and macOS)
        # Get available space in 1K blocks and convert to GB
        AVAILABLE_KB=$(df -k . | awk 'NR==2 {print $4}')
        AVAILABLE_SPACE=$((AVAILABLE_KB / 1024 / 1024))
        if [ "$AVAILABLE_SPACE" -lt 2 ]; then
            error_exit "Insufficient disk space. Need at least 2GB, have ${AVAILABLE_SPACE}GB"
        fi
        log "Disk space check passed: ${AVAILABLE_SPACE}GB available"
    fi
    
    success "Prerequisites check passed"
}

# Create backup of database and important files
create_backup() {
    if [ "$SKIP_BACKUP" = true ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi
    
    log "Creating pre-deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_timestamp
    backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/db_backup_$backup_timestamp.sql"
    
    # Check if database container is running
    if docker compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "postgres.*running"; then
        log "Backing up database..."
        if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-physio}" > "$backup_file" 2>/dev/null; then
            success "Database backup created: $backup_file"
            
            # Keep only last 5 backups
            ls -t "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null | tail -n +6 | xargs -r rm -f 2>/dev/null || true
            log "Cleaned up old backups (kept last 5)"
        else
            warn "Database backup failed, continuing anyway..."
        fi
    else
        warn "Database container not running, skipping backup"
    fi
}

# Build and deploy services
deploy_services() {
    log "Starting deployment process..."
    

    # Stop existing containers gracefully
    log "Stopping existing containers..."
    run_cmd docker compose -f "$COMPOSE_FILE" down --timeout 30

    # Build or pull images
    if grep -q "build:" "$COMPOSE_FILE"; then
        if [ "$USE_BUILDKIT" = true ]; then
            log "Building images with BuildKit (Standard Mode)..."
            log "Note: Press Ctrl+C once to cancel if needed"
            export BUILDKIT_PROGRESS=auto
            
            if ! docker compose -f "$COMPOSE_FILE" build --pull --quiet; then
                error_exit "Build failed. Check the output above for errors."
            fi
        else
            log "Building images sequentially (Legacy Stability Mode)..."
            log "Note: Using legacy builder to prevent BuildKit deadlocks"
            
            # Disable BuildKit - this prevents the 'exporting layers' hang
            export DOCKER_BUILDKIT=0
            export COMPOSE_DOCKER_CLI_BUILD=0
            export BUILDKIT_PROGRESS=plain
            
            log "Building Server image..."
            if ! docker build --pull -t mamirri-app-server -f docker/server/Dockerfile .; then
                error_exit "Server build failed."
            fi
            
            log "Building Client image..."
            if ! docker build --pull -t mamirri-app-client -f docker/client/Dockerfile .; then
                error_exit "Client build failed."
            fi
        fi
        
        # Verify images were created
        log "Verifying images were built..."
        sleep 5
        if ! docker images --format "{{.Repository}}" | grep -q "mamirri-app-server"; then
            error_exit "Build reported success but 'mamirri-app-server' image not found."
        fi
        log "Build completed successfully - images verified"
    else
        log "Pulling images..."
        if ! docker compose -f "$COMPOSE_FILE" pull; then
            error_exit "Failed to pull images. Check docker hub connectivity."
        fi
        log "Images pulled successfully"
    fi
    
    # Start services in detached mode
    log "Starting services with docker compose up..."
    log "Note: Services start in background, health checks will verify they're ready"
    if ! timeout 90 docker compose -f "$COMPOSE_FILE" up -d --remove-orphans; then
        error_exit "Failed to start services within 90 seconds. Check 'docker compose logs' for errors."
    fi
    log "Docker compose up completed"
    success "Services started successfully (health checks will verify readiness)"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to become healthy (max ${MAX_HEALTH_WAIT}s)..."
    
    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would wait for health checks"
        return 0
    fi
    
    local attempts=0
    local max_attempts=$((MAX_HEALTH_WAIT / HEALTH_CHECK_INTERVAL))
    local server_healthy=false
    local client_healthy=false
    
    while [ $attempts -lt $max_attempts ]; do
        sleep "$HEALTH_CHECK_INTERVAL"
        attempts=$((attempts + 1))
        
        # Get container states (with timeout to prevent hangs)
        local all_states
        all_states=$(timeout 10 docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null || echo "[]")
        
        # Check for unhealthy containers
        if echo "$all_states" | grep -q '"Health":"unhealthy"' 2>/dev/null; then
            error_exit "One or more services reported as unhealthy!"
        fi
        
        # Get specific service health (with timeout)
        local server_state client_state
        server_state=$(timeout 5 docker inspect --format='{{.State.Health.Status}}' physio_server 2>/dev/null || echo "unknown")
        client_state=$(timeout 5 docker inspect --format='{{.State.Health.Status}}' physio_client 2>/dev/null || echo "unknown")
        
        # Update status flags
        [ "$server_state" = "healthy" ] && server_healthy=true
        [ "$client_state" = "healthy" ] && client_healthy=true
        
        # Log progress every 6 attempts (30 seconds)
        if [ $((attempts % 6)) -eq 0 ] || [ $attempts -eq 1 ]; then
            log "Health check progress (Attempt $attempts/$max_attempts) - Server: $server_state, Client: $client_state"
        fi
        
        # Check if all critical services are healthy
        if [ "$server_healthy" = true ] && [ "$client_healthy" = true ]; then
            success "All critical services are healthy!"
            return 0
        fi
    done
    
    error_exit "Timeout waiting for services to become healthy after ${MAX_HEALTH_WAIT} seconds"
}

# Verify deployment with smoke tests
verify_deployment() {
    log "Running deployment verification..."
    
    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would verify deployment"
        return 0
    fi
    
    # Test server health endpoint
    local server_health
    if server_health=$(docker compose -f "$COMPOSE_FILE" exec -T server wget -qO- http://localhost:3000/api/v1/health 2>/dev/null); then
        success "Server health check passed: $server_health"
    else
        warn "Server health endpoint not accessible (may need more time)"
    fi
    
    # Test client accessibility
    local client_health
    if client_health=$(docker compose -f "$COMPOSE_FILE" exec -T client wget -qO- http://localhost:80/ 2>/dev/null | head -c 100); then
        success "Client accessibility check passed"
    else
        warn "Client not yet accessible (may need more time)"
    fi
    
    # Show final container status
    log "Final container status:"
    docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || true
}

# Main deployment flow
main() {
    # Handle test-build mode
    if [ "$TEST_BUILD_ONLY" = true ]; then
        log "=========================================="
        log "Running in TEST-BUILD mode (build only, no deployment)"
        log "Working directory: $(pwd)"
        log "Compose file: $COMPOSE_FILE"
        log "=========================================="
        
        check_prerequisites
        
        if [ "$USE_BUILDKIT" = true ]; then
            log "Building images with BuildKit (Standard Mode)..."
            log "Note: Press Ctrl+C once to cancel if needed"
            export BUILDKIT_PROGRESS=auto
            
            if ! docker compose -f "$COMPOSE_FILE" build --pull --quiet; then
                error_exit "Build failed. Check the output above for errors."
            fi
        else
            log "Building images sequentially (Legacy Stability Mode)..."
            log "Note: Using legacy builder to prevent BuildKit deadlocks"
            
            export DOCKER_BUILDKIT=0
            export COMPOSE_DOCKER_CLI_BUILD=0
            export BUILDKIT_PROGRESS=plain
            
            log "Building Server image..."
            if ! docker build --pull -t mamirri-app-server -f docker/server/Dockerfile .; then
                error_exit "Server build failed."
            fi
            
            log "Building Client image..."
            if ! docker build --pull -t mamirri-app-client -f docker/client/Dockerfile .; then
                error_exit "Client build failed."
            fi
        fi
        
        # Verify images were created
        log "Verifying images were built..."
        sleep 5
        if ! docker images --format "{{.Repository}}" | grep -q "mamirri-app-server"; then
            error_exit "Build reported success but 'mamirri-app-server' image not found."
        fi
        
        log "=========================================="
        success "Build test completed successfully!"
        log "Images created:"
        docker images | grep "mamirri-app" || true
        log "=========================================="
        log "Run without --test-build flag to deploy for real."
        return 0
    fi
    
    # Normal deployment flow
    log "=========================================="
    log "Starting production deployment"
    log "Working directory: $(pwd)"
    log "Compose file: $COMPOSE_FILE"
    log "=========================================="
    
    # Run all deployment steps
    check_prerequisites
    create_backup
    deploy_services
    wait_for_health
    verify_deployment
    
    log "=========================================="
    success "Deployment completed successfully!"
    log "=========================================="
    
    if [ "$DRY_RUN" = true ]; then
        log "This was a dry-run. No actual changes were made."
        log "Run without --dry-run to deploy for real."
    else
        log "Services are running and healthy"
        log "Logs available at: $LOG_FILE"
    fi
}

# Trap errors and cleanup
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ] && [ "$DRY_RUN" = false ]; then
        warn "Deployment failed with exit code $exit_code"
        warn "Check logs at: $LOG_FILE"
    fi
    exit $exit_code
}
trap cleanup EXIT

# Run main function
main "$@"
