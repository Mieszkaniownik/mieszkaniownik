#!/bin/bash

set -e

echo "Starting cache synchronization..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENVIRONMENT=${ENVIRONMENT:-production}
PROJECT_ID=${GCP_PROJECT_ID}
CDN_BUCKET="${PROJECT_ID}-frontend-assets"

echo -e "${YELLOW}Syncing static assets to Cloud Storage...${NC}"
if [ -d "/app/dist" ]; then
    gsutil -m rsync -r -c -d /app/dist gs://${CDN_BUCKET}/
    echo -e "${GREEN}Assets synced to bucket${NC}"
else
    echo -e "${YELLOW}No dist directory found, skipping sync${NC}"
fi

echo -e "${YELLOW}Invalidating CDN cache for HTML files...${NC}"
gcloud compute url-maps invalidate-cdn-cache mieszkaniownik-frontend-lb \
    --path "/index.html" \
    --async 2>/dev/null || echo "CDN invalidation skipped (not configured)"

echo -e "${YELLOW}Cleaning up old assets...${NC}"
gsutil ls -l gs://${CDN_BUCKET}/ | grep -v TOTAL | tail -n +11 | awk '{print $3}' | while read file; do
    if [ ! -z "$file" ]; then
        gsutil rm "$file" 2>/dev/null || true
    fi
done

echo -e "${YELLOW}Warming up cache...${NC}"
FRONTEND_URL=${FRONTEND_URL:-"https://mieszkaniownik.wsparcie.dev"}
curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL}/ || true
curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL}/manifest.json || true

echo -e "${YELLOW}Cache statistics:${NC}"
gsutil du -sh gs://${CDN_BUCKET}/ || echo "Unable to get cache size"

echo -e "${GREEN}Cache synchronization completed!${NC}"
echo "Timestamp: $(date)"
