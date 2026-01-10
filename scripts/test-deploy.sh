#!/bin/bash

# Test 1: Validate docker-compose.prod.yml syntax
echo "Running Test 1..."
if command -v docker >/dev/null; then
    if docker compose -f docker-compose.prod.yml config > /dev/null; then
        echo "✅ Test 1 Passed: docker-compose.prod.yml syntax is valid"
    else
        echo "❌ Test 1 Failed: docker-compose.prod.yml syntax invalid"
        exit 1
    fi
else
    echo "⚠️ Test 1 Skipped: docker command not found"
fi

# Test 2: Verify backup volume mount in compose file
echo "Running Test 2..."
if grep -q "/var/backups/physio:/backups:ro" docker-compose.prod.yml; then
    echo "✅ Test 2 Passed: Backup volume mounted"
else
    echo "❌ Test 2 Failed: Backup volume missing or incorrect"
    exit 1
fi

# Test 3: Verify Caddy integration (SERVER_HOST)
echo "Running Test 3..."
if grep -q "SERVER_HOST" docker-compose.prod.yml; then
    echo "✅ Test 3 Passed: SERVER_HOST env var present"
else
    echo "❌ Test 3 Failed: SERVER_HOST env var missing"
    exit 1
fi

# Test 4: Deploy script dry-run
echo "Running Test 4..."
# Use local log file for test to avoid permission errors
export LOG_FILE="./test-deploy.log"
OUTPUT=$(./scripts/deploy.sh --dry-run)
if echo "$OUTPUT" | grep -q "Would run: docker compose"; then
    echo "✅ Test 4 Passed: Deploy script dry-run works"
    rm -f "$LOG_FILE"
else
    echo "❌ Test 4 Failed: Deploy script dry-run failed"
    echo "Output: $OUTPUT"
    rm -f "$LOG_FILE"
    exit 1
fi

echo "All deployment validation tests passed!"
