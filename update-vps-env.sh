#!/bin/bash

# Update VPS Environment Variables
# Run this script ON THE VPS after git pull

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Updating VPS Environment Variables ===${NC}"
echo ""

# Detect VPS IP
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "UNKNOWN")
echo -e "${YELLOW}Detected VPS IP: ${VPS_IP}${NC}"
echo ""

if [ "$VPS_IP" = "UNKNOWN" ]; then
    read -p "Enter your VPS IP address: " VPS_IP
fi

echo -e "${YELLOW}Updating backend/.env...${NC}"
cd ~/mieszkaniownik

# Update ROOT .env file (for docker-compose build args)
echo -e "${YELLOW}Updating root .env (Docker Compose)...${NC}"
if [ -f ".env" ]; then
    if grep -q "^VITE_API_BASE_URL=" .env; then
        sed -i "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://${VPS_IP}:5001|" .env
    else
        echo "VITE_API_BASE_URL=http://${VPS_IP}:5001" >> .env
    fi
    echo -e "${GREEN}✅ Updated root .env${NC}"
else
    echo -e "${RED}❌ Root .env not found, creating it${NC}"
    echo "VITE_API_BASE_URL=http://${VPS_IP}:5001" > .env
fi

# Backend updates
if grep -q "^FRONTEND_URL=" backend/.env || grep -q "^FRONTEND_URL=" mieszkaniownik-backend/.env; then
    BACKEND_ENV="backend/.env"
    [ -f "mieszkaniownik-backend/.env" ] && BACKEND_ENV="mieszkaniownik-backend/.env"
    
    sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=http://${VPS_IP}:5173|" $BACKEND_ENV
    sed -i "s|^GOOGLE_CALLBACK_URL=.*|GOOGLE_CALLBACK_URL=http://${VPS_IP}:5001/auth/google/callback|" $BACKEND_ENV
    
    # Add or update CORS_ORIGIN
    if grep -q "^CORS_ORIGIN=" $BACKEND_ENV; then
        sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://${VPS_IP}:5173,http://localhost:5173|" $BACKEND_ENV
    else
        echo "" >> $BACKEND_ENV
        echo "CORS_ORIGIN=http://${VPS_IP}:5173,http://localhost:5173" >> $BACKEND_ENV
    fi
    
    echo -e "${GREEN}✅ Updated $BACKEND_ENV${NC}"
else
    echo -e "${RED}❌ Backend .env not found${NC}"
fi

echo ""
echo -e "${YELLOW}Updating frontend/.env...${NC}"

# Frontend updates
if [ -f "frontend/.env" ] || [ -f "mieszkaniownik-frontend/.env" ]; then
    FRONTEND_ENV="frontend/.env"
    [ -f "mieszkaniownik-frontend/.env" ] && FRONTEND_ENV="mieszkaniownik-frontend/.env"
    
    if grep -q "^VITE_API_BASE_URL=" $FRONTEND_ENV; then
        sed -i "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://${VPS_IP}:5001|" $FRONTEND_ENV
    else
        echo "VITE_API_BASE_URL=http://${VPS_IP}:5001" >> $FRONTEND_ENV
    fi
    
    echo -e "${GREEN}✅ Updated $FRONTEND_ENV${NC}"
else
    echo -e "${RED}❌ Frontend .env not found${NC}"
fi

echo ""
echo -e "${GREEN}=== Configuration Updated ===${NC}"
echo ""
echo "Backend environment:"
grep -E "^(FRONTEND_URL|GOOGLE_CALLBACK_URL|CORS_ORIGIN)=" $BACKEND_ENV 2>/dev/null || echo "No backend env found"
echo ""
echo "Frontend environment:"
grep "^VITE_API_BASE_URL=" $FRONTEND_ENV 2>/dev/null || echo "No frontend env found"
echo ""

echo -e "${YELLOW}Now rebuild the containers:${NC}"
echo "docker compose down"
echo "docker compose build --no-cache"
echo "docker compose up -d"