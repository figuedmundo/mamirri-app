#!/bin/bash

# Configuration
EXAMPLE_FILE=".env.example"
ENV_FILE=".env"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting environment setup..."

if [ ! -f "$EXAMPLE_FILE" ]; then
    echo -e "${RED}Error: $EXAMPLE_FILE not found!${NC}"
    exit 1
fi

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: $ENV_FILE already exists.${NC}"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping overwrite. Checking permissions..."
    else
        echo "Overwriting $ENV_FILE..."
        cp "$EXAMPLE_FILE" "$ENV_FILE"
    fi
else
    echo "Creating $ENV_FILE from $EXAMPLE_FILE..."
    cp "$EXAMPLE_FILE" "$ENV_FILE"
fi

# Set permissions to 600 (read/write by owner only)
echo "Setting permissions to 600 for $ENV_FILE..."
chmod 600 "$ENV_FILE"

echo -e "${GREEN}Environment setup complete!${NC}"
echo -e "${YELLOW}IMPORTANT: Please update $ENV_FILE with real secret values!${NC}"
echo "Especially:"
echo " - POSTGRES_PASSWORD"
echo " - MINIO_ROOT_PASSWORD"
echo " - JWT_SECRET"
echo " - BACKUP_ENCRYPTION_KEY"

exit 0
