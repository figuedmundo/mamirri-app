#!/bin/bash

# Test 1: Lint workflow exists and triggers on PR
echo "Running Test 1..."
if grep -q "pull_request:" .github/workflows/lint.yml; then
    echo "✅ Test 1 Passed: Lint workflow triggers on PR"
else
    echo "❌ Test 1 Failed: Lint workflow missing PR trigger"
    exit 1
fi

# Test 2: Test workflow exists and triggers on PR
echo "Running Test 2..."
if grep -q "pull_request:" .github/workflows/test.yml; then
    echo "✅ Test 2 Passed: Test workflow triggers on PR"
else
    echo "❌ Test 2 Failed: Test workflow missing PR trigger"
    exit 1
fi

# Test 3: E2E workflow exists and triggers on PR
echo "Running Test 3..."
if grep -q "pull_request:" .github/workflows/test-e2e.yml; then
    echo "✅ Test 3 Passed: E2E workflow triggers on PR"
else
    echo "❌ Test 3 Failed: E2E workflow missing PR trigger"
    exit 1
fi

# Test 4: Deploy workflow exists and triggers on push to main
echo "Running Test 4..."
if grep -q "push:" .github/workflows/deploy.yml && grep -q "branches: \[main\]" .github/workflows/deploy.yml; then
    echo "✅ Test 4 Passed: Deploy workflow triggers on push to main"
else
    echo "❌ Test 4 Failed: Deploy workflow missing push to main trigger"
    exit 1
fi

# Test 5: Deploy workflow uses production environment
echo "Running Test 5..."
if grep -q "environment: production" .github/workflows/deploy.yml; then
    echo "✅ Test 5 Passed: Deploy workflow uses production environment"
else
    echo "❌ Test 5 Failed: Deploy workflow missing environment: production"
    exit 1
fi

echo "All workflow validation tests passed!"
