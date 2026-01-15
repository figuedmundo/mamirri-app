#!/bin/bash

# Create a temporary directory for testing
TEST_DIR=$(mktemp -d)
cp scripts/setup-env.sh "$TEST_DIR/"
cd "$TEST_DIR" || exit 1

# Create a dummy .env.example in temp dir
echo "TEST_VAR=true" > .env.example

# Test 1: setup-env.sh creates .env
echo "Running Test 1..."
echo "y" | ./setup-env.sh > /dev/null
if [ -f ".env" ]; then
    echo "✅ Test 1 Passed: .env created"
else
    echo "❌ Test 1 Failed: .env not created"
    rm -rf "$TEST_DIR"
    exit 1
fi

# Test 2: Permissions are 600
echo "Running Test 2..."
# Stat syntax differs on BSD (Mac) vs GNU (Linux)
if stat -f %Lp .env 2>/dev/null | grep -q "600" || stat -c %a .env 2>/dev/null | grep -q "600"; then
    echo "✅ Test 2 Passed: Permissions are 600"
else
    PERM=$(stat -f %Lp .env 2>/dev/null || stat -c %a .env 2>/dev/null)
    echo "❌ Test 2 Failed: Permissions are $PERM (expected 600)"
    rm -rf "$TEST_DIR"
    exit 1
fi

# Test 3: Idempotency / Graceful failure
echo "Running Test 3..."
OUT=$(echo "n" | ./setup-env.sh)
if echo "$OUT" | grep -q "Warning: .env already exists"; then
    echo "✅ Test 3 Passed: Warns about existing file"
else
    echo "❌ Test 3 Failed: Did not warn about existing file"
    echo "Output: $OUT"
    rm -rf "$TEST_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEST_DIR"
echo "All tests passed!"
