#!/bin/bash
set -e

echo "🚀 Setting up PhysioCopilot Dev Environment..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not installed"; exit 1; }

if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  
  JWT_SECRET=$(./scripts/generate-password.sh 32 hex)
  sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
  
  echo "⚠️  IMPORTANT: Edit .env and add your API keys (GROQ_API_KEY, GOOGLE_API_KEY)"
fi

export $(cat .env | grep -v '^#' | xargs)

echo "📦 Starting Docker services..."
docker compose up -d

echo "⏳ Waiting for PostgreSQL..."
until docker exec physio_db pg_isready -U ${POSTGRES_USER}; do
  sleep 2
done

echo "📥 Installing dependencies..."
pnpm install

echo "🗄️ Setting up database..."
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}"
export DATABASE_URL

pnpm --filter server exec prisma migrate deploy
pnpm --filter server run seed

echo "🪣 Creating MinIO bucket..."
docker exec physio_storage mc config host add local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} || true
docker exec physio_storage mc mb local/${MINIO_BUCKET} || true
docker exec physio_storage mc anonymous set public local/${MINIO_BUCKET}

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and add your API keys if you haven't already"
echo "   2. Run 'pnpm dev' to start both client and server"
echo ""
echo "🌐 Access:"
echo "   Frontend:  http://localhost:${CLIENT_PORT}"
echo "   Backend:   http://localhost:${SERVER_PORT}"
echo "   MinIO UI:  http://localhost:${MINIO_CONSOLE_PORT}"
