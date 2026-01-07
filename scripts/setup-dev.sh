#!/bin/bash
set -e

echo "🚀 Setting up PhysioCopilot Dev Environment..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not installed"; exit 1; }

if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  IMPORTANT: Edit .env and add your API keys (GROQ_API_KEY, GOOGLE_API_KEY)"
  echo "⚠️  Press ENTER to continue or CTRL+C to abort and edit .env first..."
  read
fi

export $(cat .env | grep -v '^#' | xargs)

echo "📦 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL..."
until docker exec physio_db pg_isready -U ${POSTGRES_USER}; do
  sleep 2
done

echo "📥 Installing dependencies..."
pnpm install

echo "🗄️ Setting up database..."
cd apps/server
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma db seed 2>/dev/null || echo "⚠️  No seed file yet (that's ok)"
cd ../..

echo "🪣 Creating MinIO bucket..."
docker exec physio_storage mc config host add local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} || true
docker exec physio_storage mc mb local/${MINIO_BUCKET} || true
docker exec physio_storage mc anonymous set public local/${MINIO_BUCKET}

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔑 Credentials:"
echo "   Database: ${POSTGRES_USER} / ${POSTGRES_PASSWORD}"
echo "   MinIO:    ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD}"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and add your API keys if you haven't already"
echo "   2. Run 'pnpm dev' to start both client and server"
echo ""
echo "🌐 Access:"
echo "   Frontend:  http://localhost:${CLIENT_PORT}"
echo "   Backend:   http://localhost:${SERVER_PORT}"
echo "   MinIO UI:  http://localhost:${MINIO_CONSOLE_PORT} (${MINIO_ROOT_USER}/${MINIO_ROOT_PASSWORD})"
echo "   Postgres:  localhost:${POSTGRES_PORT}"
