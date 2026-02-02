#!/bin/sh
set -e

echo "=== Server Container Initialization ==="
echo "Node version: $(node --version)"
echo "Environment: ${NODE_ENV}"

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if pg_isready -h postgres -p 5432 -U "${POSTGRES_USER}" > /dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Database not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES) - sleeping..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: Database connection timeout after $MAX_RETRIES attempts"
  exit 1
fi

# Run database migrations
echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "ERROR: Database migration failed"
  exit 1
fi
echo "Migrations completed successfully"

# Run seed script (only if SEED_DATABASE is set to true)
# Note: Seed script requires ts-node which is not available in production
# For production seeding, use a compiled JS seed script or run manually
if [ "${SEED_DATABASE}" = "true" ]; then
  echo "Running seed script..."
  if command -v ts-node >/dev/null 2>&1; then
    if ! npx prisma db seed; then
      echo "WARNING: Database seeding failed (this may be OK if already seeded)"
    else
      echo "Seeding completed successfully"
    fi
  else
    echo "WARNING: ts-node not available in production. Skipping automatic seeding."
    echo "To seed the database, run the seed script manually with proper tooling."
  fi
else
  echo "Skipping database seed (set SEED_DATABASE=true to enable)"
fi

echo "=== Initialization complete. Starting application ==="
exec "$@"
