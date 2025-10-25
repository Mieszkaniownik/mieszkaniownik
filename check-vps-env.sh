#!/bin/bash

# Check VPS Environment Files Status
# Run this ON THE VPS to diagnose the issue

echo "=== Checking VPS Environment Files ==="
echo ""

echo "=== Directory Structure ==="
ls -la ~/mieszkaniownik/ | grep -E "backend|frontend|.env"
echo ""

echo "=== Backend .env location ==="
if [ -f ~/mieszkaniownik/backend/.env ]; then
    echo "✅ Found: ~/mieszkaniownik/backend/.env"
    BACKEND_ENV=~/mieszkaniownik/backend/.env
elif [ -f ~/mieszkaniownik/mieszkaniownik-backend/.env ]; then
    echo "✅ Found: ~/mieszkaniownik/mieszkaniownik-backend/.env"
    BACKEND_ENV=~/mieszkaniownik/mieszkaniownik-backend/.env
else
    echo "❌ Backend .env NOT FOUND"
    BACKEND_ENV=""
fi

if [ -n "$BACKEND_ENV" ]; then
    echo ""
    echo "=== Backend Environment Variables ==="
    grep -E "^(FRONTEND_URL|GOOGLE_CALLBACK_URL|CORS_ORIGIN|PORT|NODE_ENV)" "$BACKEND_ENV" || echo "None found"
fi

echo ""
echo "=== Frontend .env location ==="
if [ -f ~/mieszkaniownik/frontend/.env ]; then
    echo "✅ Found: ~/mieszkaniownik/frontend/.env"
    FRONTEND_ENV=~/mieszkaniownik/frontend/.env
elif [ -f ~/mieszkaniownik/mieszkaniownik-frontend/.env ]; then
    echo "✅ Found: ~/mieszkaniownik/mieszkaniownik-frontend/.env"
    FRONTEND_ENV=~/mieszkaniownik/mieszkaniownik-frontend/.env
else
    echo "❌ Frontend .env NOT FOUND"
    FRONTEND_ENV=""
fi

if [ -n "$FRONTEND_ENV" ]; then
    echo ""
    echo "=== Frontend Environment Variables ==="
    grep -E "^VITE_" "$FRONTEND_ENV" || echo "None found"
fi

echo ""
echo "=== Docker Compose Environment ==="
docker exec mieszkaniownik-backend env | grep -E "FRONTEND_URL|CORS_ORIGIN|PORT" | sort
echo ""
docker exec mieszkaniownik-frontend env | grep -E "VITE_" | sort

echo ""
echo "=== Frontend Built Code Check ==="
echo "Checking if frontend container has the new API detection code:"
if docker exec mieszkaniownik-frontend cat /app/src/api/api.js 2>/dev/null | grep -q "console.log.*\[API\]"; then
    echo "✅ New code with debug logging found"
    docker exec mieszkaniownik-frontend cat /app/src/api/api.js | grep "console.log" | head -5
else
    echo "❌ Old code - no debug logging found"
    docker exec mieszkaniownik-frontend cat /app/src/api/api.js | head -10
fi

echo ""
echo "=== What API URL is being used? ==="
docker exec mieszkaniownik-frontend cat /app/src/api/api.js | grep -A 2 "export const API_BASE_URL"