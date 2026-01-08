#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until pg_isready -h postgres -p 5432 -U "${POSTGRES_USER}"; do
  echo "Database is not ready yet - sleeping"
  sleep 2
done

echo "Database is ready! Running migrations..."
npx prisma migrate deploy

echo "Running seed script..."
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
npx prisma db seed

echo "Initialization complete. Starting application..."
exec "$@"
