# Developer Setup Guide

## Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

## Quick Start

1. Clone the repository
```bash
git clone <repo-url>
cd mamirri-app
```

2. Run setup script
```bash
./scripts/setup-dev.sh
```

3. Edit .env with your API keys
```bash
nano .env
# Add: GROQ_API_KEY, GOOGLE_API_KEY
```

4. Start development servers
```bash
pnpm dev
```

5. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MinIO: http://localhost:9001

---

**Last Updated:** $(date +%Y-%m-%d)
