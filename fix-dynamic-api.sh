#!/bin/bash

# Dynamic API URL Fix - No More Hardcoded IPs!
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== Dynamic API URL Fix Deployment ===${NC}"
echo ""

echo -e "${BLUE}How the new auto-detection works:${NC}"
echo "🏠 localhost → API calls to http://localhost:5001"
echo "☁️  VPS       → API calls to http://[VPS-IP]:5001"
echo "🌐 Production → API calls to https://[DOMAIN]:5001"
echo ""

echo -e "${YELLOW}Changes made:${NC}"
echo "✅ Frontend: Dynamic API URL detection in api.js"
echo "✅ Frontend: Set VITE_API_BASE_URL=auto for auto-detection"
echo "✅ Backend: Already configured for CORS with VPS IPs"
echo ""

# Commit changes
echo -e "${GREEN}Step 1: Committing changes...${NC}"
git add .
git commit -m "feat(api): implement dynamic API URL detection

- Add intelligent API URL detection in frontend
- Automatically detects localhost vs VPS vs production
- No more hardcoded IPs in environment files
- Works seamlessly across all environments
- Frontend will call correct backend URL automatically"

echo -e "${GREEN}Step 2: Pushing to dev...${NC}"
git push origin dev

echo ""
echo -e "${YELLOW}Deploy to VPS (containers MUST be rebuilt):${NC}"
echo ""
echo "# 1. SSH into VPS"
echo "gcloud compute ssh mieszkaniownik-fullstack --zone=europe-central2-a"
echo ""
echo "# 2. Pull changes and FORCE REBUILD"
echo "cd ~/mieszkaniownik"
echo "git pull origin dev"
echo ""
echo "# 3. IMPORTANT: Force rebuild with --no-cache"
echo "docker compose down"
echo "docker compose build --no-cache"
echo "docker compose up -d"
echo ""
echo "# 4. Verify the fix"
echo "echo 'Check frontend container for new API detection:'"
echo "docker exec mieszkaniownik-frontend cat /app/src/api/api.js | head -20"
echo ""
echo "# 5. Test in browser"
echo "echo 'Visit http://[VPS-IP]:5173 and check Network tab'"
echo "echo 'API calls should now go to http://[VPS-IP]:5001 ✅'"
echo ""

echo -e "${GREEN}Changes committed and pushed!${NC}"
echo ""
echo -e "${BLUE}What this fixes:${NC}"
echo "❌ Before: Frontend hardcoded to localhost:5001 (wrong on VPS)"
echo "✅ After:  Frontend auto-detects correct backend URL"
echo ""
echo -e "${BLUE}Testing:${NC}"
echo "• Local dev: Visit http://localhost:5173 → calls localhost:5001"
echo "• VPS: Visit http://34.116.180.59:5173 → calls 34.116.180.59:5001"
echo "• Production: Visit https://mieszkaniownik.com → calls mieszkaniownik.com:5001"
echo ""
echo -e "${YELLOW}Note: Container rebuild is required to pick up new frontend code!${NC}"