#!/bin/bash

# Configuration
# This uses existing environment variables from the context or creates mocks
BACKUP_DIR="${BACKUP_DIR:-./test-backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
LOG_FILE="./test-backup.log"
BACKUP_ENCRYPTION_KEY="test_key"
export BACKUP_DIR
export BACKUP_RETENTION_DAYS
export LOG_FILE
export BACKUP_ENCRYPTION_KEY
export POSTGRES_USER="test_user"
export POSTGRES_PASSWORD="test_password"
export POSTGRES_DB="test_db"
export DATABASE_URL="postgres://test_user:test_password@localhost:5432/test_db"

# Mock pg_dump, gpg, psql commands to avoid needing running postgres/gpg
# We create a temporary bin directory and add it to PATH
MOCK_BIN="./mock-bin"
mkdir -p "$MOCK_BIN"
mkdir -p "$BACKUP_DIR"

# Create mock pg_dump
cat << 'EOF' > "$MOCK_BIN/pg_dump"
#!/bin/bash
echo "Mock pg_dump executed"
echo "INSERT INTO tests VALUES (1);"
EOF
chmod +x "$MOCK_BIN/pg_dump"

# Create mock gpg
cat << 'EOF' > "$MOCK_BIN/gpg"
#!/bin/bash
MODE=""
OUTPUT=""
INPUT=""

# Simple argument parsing
for arg in "$@"; do
    if [[ "$arg" == "--symmetric" ]]; then
        MODE="encrypt"
    elif [[ "$arg" == "--decrypt" ]]; then
        MODE="decrypt"
    elif [[ "$prev_arg" == "-o" ]]; then
        OUTPUT="$arg"
    fi
    prev_arg="$arg"
done

# Last argument is usually input file (unless it's an option)
INPUT="${!#}"

if [[ "$MODE" == "encrypt" ]]; then
    # Mock encryption: just copy input to output (simulated)
    # If no output specified, gpg usually adds .gpg, but our script specifies -o
    if [[ -n "$OUTPUT" ]]; then
        cp "$INPUT" "$OUTPUT"
    else
        cp "$INPUT" "${INPUT}.gpg"
    fi
elif [[ "$MODE" == "decrypt" ]]; then
    # Mock decryption: just cat the input file
    cat "$INPUT"
fi
EOF
chmod +x "$MOCK_BIN/gpg"

# Create mock psql
cat << 'EOF' > "$MOCK_BIN/psql"
#!/bin/bash
# Consume input
cat > /dev/null
echo "Mock psql executed"
EOF
chmod +x "$MOCK_BIN/psql"

export PATH="$PWD/$MOCK_BIN:$PATH"

# Test 1: Backup script creates encrypted .gpg file
echo "Running Test 1..."
./scripts/backup-postgres.sh > backup_stdout.log 2> backup_stderr.log
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "Script exited with code $EXIT_CODE"
    echo "STDOUT:"
    cat backup_stdout.log
    echo "STDERR:"
    cat backup_stderr.log
    echo "LOG FILE:"
    cat "$LOG_FILE"
fi

LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.gpg 2>/dev/null | head -n 1)
if [[ -f "$LATEST_BACKUP" ]]; then
    echo "✅ Test 1 Passed: Encrypted backup created: $LATEST_BACKUP"
else
    echo "❌ Test 1 Failed: No backup file created"
    exit 1
fi

# Test 2: Backup script logs operations
echo "Running Test 2..."
if grep -q "Backup completed successfully" "$LOG_FILE"; then
    echo "✅ Test 2 Passed: Log file contains success message"
else
    echo "❌ Test 2 Failed: Log file missing success message"
    exit 1
fi

# Test 3: Retention policy deletes old backups
echo "Running Test 3..."
# Create a dummy old backup (8 days ago)
OLD_BACKUP="$BACKUP_DIR/physio-backup-2020-01-01-00-00-00.sql.gpg"
touch -d "8 days ago" "$OLD_BACKUP" 2>/dev/null || touch -t 202001010000 "$OLD_BACKUP" # BSD/Linux compat
./scripts/backup-postgres.sh
if [[ ! -f "$OLD_BACKUP" ]]; then
    echo "✅ Test 3 Passed: Old backup deleted"
else
    echo "❌ Test 3 Failed: Old backup still exists"
    exit 1
fi

# Test 4: Restore script successfully decrypts and restores
echo "Running Test 4..."
# We use the backup created in Test 1
./scripts/restore-postgres.sh "$LATEST_BACKUP"
if grep -q "Restore completed successfully" "$LOG_FILE"; then
    echo "✅ Test 4 Passed: Restore script ran successfully"
else
    echo "❌ Test 4 Failed: Restore script failed"
    exit 1
fi

# Cleanup
rm -rf "$MOCK_BIN" "$BACKUP_DIR" "$LOG_FILE"
echo "All tests passed!"
