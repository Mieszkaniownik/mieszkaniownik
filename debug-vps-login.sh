#!/bin/bash

# VPS Debug and Fix Script
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== VPS Login Debug & Fix ===${NC}"
echo ""

VPS_IP=$(curl -s ifconfig.me || echo "UNKNOWN")
echo -e "${BLUE}Detected VPS IP: ${VPS_IP}${NC}"
echo ""

echo -e "${YELLOW}Step 1: Checking current container status...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${YELLOW}Step 2: Checking if frontend has new code...${NC}"
echo "Looking for dynamic API detection in frontend container:"
if docker exec mieszkaniownik-frontend cat /app/src/api/api.js 2>/dev/null | grep -q "getApiBaseUrl"; then
    echo -e "${GREEN}✅ Dynamic API detection found in container${NC}"
else
    echo -e "${RED}❌ Old frontend code still in container - rebuild needed!${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Checking backend CORS configuration...${NC}"
echo "Backend allowed origins:"
docker exec mieszkaniownik-backend env | grep -E "FRONTEND_URL|CORS_ORIGIN" || echo "No CORS environment variables found"
echo ""

echo -e "${YELLOW}Step 4: Testing API connectivity...${NC}"
echo "Testing backend health endpoint:"
if curl -s -f http://localhost:5001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend responding on localhost:5001${NC}"
else
    echo -e "${RED}❌ Backend not responding on localhost:5001${NC}"
fi

if curl -s -f http://${VPS_IP}:5001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend responding on ${VPS_IP}:5001${NC}"
else
    echo -e "${RED}❌ Backend not responding on ${VPS_IP}:5001${NC}"
fi
echo ""

echo -e "${YELLOW}Step 5: Testing CORS with actual request...${NC}"
echo "Simulating frontend CORS request:"
curl -v -X OPTIONS \
  -H "Origin: http://${VPS_IP}:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  http://${VPS_IP}:5001/auth/login 2>&1 | grep -E "< HTTP|< Access-Control" || echo "No CORS headers found"
echo ""

echo -e "${GREEN}=== FIX COMMANDS ===${NC}"
echo ""
echo -e "${YELLOW}If frontend container doesn't have new code:${NC}"
echo "docker compose down"
echo "docker compose build --no-cache frontend" 
echo "docker compose up -d"
echo ""

echo -e "${YELLOW}If backend CORS is missing VPS IP:${NC}"
echo "# Add to backend/.env:"
echo "FRONTEND_URL=http://${VPS_IP}:5173"
echo "CORS_ORIGIN=http://${VPS_IP}:5173,http://localhost:5173"
echo "# Then restart:"
echo "docker compose restart backend"
echo ""

echo -e "${YELLOW}Complete rebuild (if all else fails):${NC}"
echo "docker compose down"
echo "docker compose build --no-cache"
echo "docker compose up -d"
echo ""

echo -e "${BLUE}Expected working URLs:${NC}"
echo "Frontend: http://${VPS_IP}:5173"
echo "Backend:  http://${VPS_IP}:5001"
echo "API calls should go: ${VPS_IP}:5173 → ${VPS_IP}:5001"