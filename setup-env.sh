#!/bin/bash

set -e

echo "Mieszkaniownik Environment Setup"
echo "==================================="
echo ""

setup_root_env() {
    echo "Setting up root .env (Docker Compose infrastructure)..."
    
    if [ -f .env ]; then
        echo "Root .env file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping root .env"
            return
        fi
    fi
    
    cp .env.example .env
    
    echo ""
    echo "Database Configuration"
    read -p "Enter Postgres password (default: password): " POSTGRES_PASSWORD
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
    
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "s|POSTGRES_PASSWORD=password|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
    else
        sed -i "s|POSTGRES_PASSWORD=password|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
    fi
    
    echo "Root .env created (Docker Compose infrastructure only)"
}

setup_backend_env() {
    echo ""
    echo "Setting up backend .env (application configuration)..."
    
    if [ -f mieszkaniownik-backend/.env ]; then
        echo "Backend .env file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping backend .env"
            return
        fi
    fi
    
    if [ ! -f mieszkaniownik-backend/.env.example ]; then
        echo "mieszkaniownik-backend/.env.example not found!"
        return
    fi
    
    cp mieszkaniownik-backend/.env.example mieszkaniownik-backend/.env

    echo ""
    echo "Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "s|JWT_SECRET=\"mieszkaniownik-jwt-secret-change-this\"|JWT_SECRET=\"$JWT_SECRET\"|" mieszkaniownik-backend/.env
    else
        sed -i "s|JWT_SECRET=\"mieszkaniownik-jwt-secret-change-this\"|JWT_SECRET=\"$JWT_SECRET\"|" mieszkaniownik-backend/.env
    fi
    
    echo "Backend .env created with generated JWT secret"
}

setup_frontend_env() {
    echo ""
    echo "Setting up frontend .env (optional for local development)..."
    
    if [ -f mieszkaniownik-frontend/.env ]; then
        echo "Frontend .env file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping frontend .env"
            return
        fi
    fi
    
    if [ ! -f mieszkaniownik-frontend/.env.example ]; then
        echo "mieszkaniownik-frontend/.env.example not found!"
        return
    fi
    
    cp mieszkaniownik-frontend/.env.example mieszkaniownik-frontend/.env
    echo "Frontend .env created"
}

setup_root_env
setup_backend_env
setup_frontend_env

echo ""
echo "Environment setup complete!"
echo ""
echo "Next Steps:"
echo ""
echo "1. Edit mieszkaniownik-backend/.env and add your Google OAuth credentials:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   Get them from: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. (Optional) Configure additional services in mieszkaniownik-backend/.env:"
echo "   - GOOGLE_MAPS_API_KEY (for maps)"
echo "   - DISCORD_BOT_TOKEN (for Discord notifications)"
echo "   - Email OAuth credentials (for email notifications)"
echo "   - SCRAPER_ENABLED=true (to enable web scraping)"
echo ""
echo "3. Start the application:"
echo "   docker compose up"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5001"
echo "   - Swagger Docs: http://localhost:5001/api"
echo ""
echo "For detailed setup instructions, see ENV_SETUP_GUIDE.md"
echo ""
