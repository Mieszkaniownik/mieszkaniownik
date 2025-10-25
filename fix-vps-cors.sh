#!/bin/bash

# VPS CORS Fix Deployment Script
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== VPS CORS Fix Deployment ===${NC}"
echo ""

VPS_IP="34.116.180.59"

echo -e "${YELLOW}Changes made:${NC}"
echo "✅ Frontend .env: VITE_API_BASE_URL → http://${VPS_IP}:5001"
echo "✅ Backend .env: FRONTEND_URL → http://${VPS_IP}:5173"  
echo "✅ Backend .env: Added CORS_ORIGIN with VPS IP"
echo "✅ Backend main.ts: Added VPS IP to allowedDomains"
echo ""

# Commit changes
echo -e "${GREEN}Step 1: Committing changes...${NC}"
git add .
git commit -m "fix(vps-cors): configure frontend and backend for VPS deployment

- Update frontend API URL to VPS IP (${VPS_IP}:5001)
- Update backend CORS to allow VPS frontend origin (${VPS_IP}:5173)
- Add CORS_ORIGIN environment variable support
- Fix OAuth callback URL for VPS deployment"

echo -e "${GREEN}Step 2: Pushing to dev...${NC}"
git push origin dev

echo ""
echo -e "${YELLOW}Now run these commands on your VPS to deploy:${NC}"
echo ""
echo "# 1. SSH into VPS"
echo "gcloud compute ssh mieszkaniownik-fullstack --zone=europe-central2-a"
echo ""
echo "# 2. Navigate and pull changes"
echo "cd ~/mieszkaniownik"
echo "git pull origin dev"
echo ""
echo "# 3. Force rebuild containers with new environment"
echo "docker compose kill"
echo "docker compose rm -f"
echo "docker compose up -d --build --force-recreate"
echo ""
echo "# 4. Monitor logs"
echo "docker compose logs -f backend | head -20"
echo ""
echo "# 5. Test CORS fix"
echo "echo 'Visit: http://${VPS_IP}:5173 and try logging in'"
echo ""

echo -e "${GREEN}Local changes committed and pushed!${NC}"
echo ""
echo -e "${YELLOW}Expected behavior after deployment:${NC}"
echo "✅ Frontend will make requests to http://${VPS_IP}:5001"
echo "✅ Backend will accept requests from http://${VPS_IP}:5173"  
echo "✅ No more CORS errors in browser console"
echo "✅ Login should work successfully"
echo ""
echo -e "${RED}If still having issues, check:${NC}"
echo "1. Backend logs: docker compose logs backend | grep -i cors"
echo "2. Frontend network tab for API calls"
echo "3. Environment variables: docker exec mieszkaniownik-backend env | grep -E 'FRONTEND|CORS'"