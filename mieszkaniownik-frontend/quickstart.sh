#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Mieszkaniownik Frontend Deployment Quick Start       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}✗ gcloud CLI is not installed${NC}"; exit 1; }
echo -e "${GREEN}gcloud CLI installed${NC}"

command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}✗ kubectl is not installed${NC}"; exit 1; }
echo -e "${GREEN}kubectl installed${NC}"

command -v helm >/dev/null 2>&1 || { echo -e "${RED}✗ helm is not installed${NC}"; exit 1; }
echo -e "${GREEN}helm installed${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}✗ docker is not installed${NC}"; exit 1; }
echo -e "${GREEN}docker installed${NC}"

echo ""

echo -e "${YELLOW}Please provide the following information:${NC}"
echo ""

read -p "GCP Project ID: " PROJECT_ID
read -p "Domain [mieszkaniownik.wsparcie.dev]: " DOMAIN
DOMAIN=${DOMAIN:-mieszkaniownik.wsparcie.dev}
read -p "Environment (production/development) [production]: " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-production}

read -p "Region [europe-central2]: " REGION
REGION=${REGION:-europe-central2}

read -p "Zone [europe-central2-a]: " ZONE
ZONE=${ZONE:-europe-central2-a}

echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Domain: $DOMAIN"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Zone: $ZONE"
echo ""

read -p "Continue with this configuration? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable dns.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo ""
echo -e "${YELLOW}How would you like to set up the infrastructure?${NC}"
echo "1) Terraform (recommended)"
echo "2) Manual setup scripts"
read -p "Choose option (1 or 2): " -n 1 -r SETUP_OPTION
echo ""

if [[ $SETUP_OPTION == "1" ]]; then
    if command -v terraform >/dev/null 2>&1; then
        echo -e "${YELLOW}Setting up infrastructure with Terraform...${NC}"
        
        cd terraform
        
        cat > terraform.tfvars <<EOF
project_id = "$PROJECT_ID"
region     = "$REGION"
zone       = "$ZONE"
domain     = "$DOMAIN"
EOF
        
        terraform init
        terraform plan
        
        read -p "Apply Terraform configuration? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform apply
            
            FRONTEND_IP=$(terraform output -raw frontend_ip_address)
            DNS_SERVERS=$(terraform output -json dns_name_servers)
            
            echo ""
            echo -e "${GREEN}✓ Infrastructure created successfully!${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Configure your domain's nameservers to: $DNS_SERVERS"
            echo "2. Or create an A record pointing to: $FRONTEND_IP"
        fi
        
        cd ..
    else
        echo -e "${RED}Terraform is not installed. Please install it or use manual setup.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Setting up infrastructure manually...${NC}"
    
    chmod +x scripts/*.sh
    
    ./scripts/setup-gke.sh $ENVIRONMENT
fi

echo ""
echo -e "${YELLOW}Getting ingress IP address...${NC}"
sleep 5
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ ! -z "$INGRESS_IP" ]; then
    echo -e "${GREEN}Ingress IP: $INGRESS_IP${NC}"
    echo ""
    echo -e "${YELLOW}DNS Configuration:${NC}"
    echo "Create the following DNS A records:"
    echo "  $DOMAIN → $INGRESS_IP"
    echo "  api.$DOMAIN → $INGRESS_IP (or backend ingress IP)"
else
    echo -e "${YELLOW}Ingress IP not yet available. Check back in a few minutes with:${NC}"
    echo "kubectl get svc -n ingress-nginx"
fi

echo ""
read -p "Would you like to deploy the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Building and deploying application...${NC}"
    
    IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
    IMAGE_NAME="eu.gcr.io/$PROJECT_ID/mieszkaniownik-frontend:$IMAGE_TAG"
    
    docker build -t $IMAGE_NAME .
    docker push $IMAGE_NAME
    
    ./scripts/deploy.sh $ENVIRONMENT $IMAGE_TAG
    
    echo ""
    echo -e "${GREEN}Application deployed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo ""
echo "1. Configure your domain DNS to point to: $INGRESS_IP"
echo "2. Wait for SSL certificates to be issued (may take 5-10 minutes)"
echo "3. Access your application at: https://$DOMAIN"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  Check deployment: kubectl get all -n $ENVIRONMENT"
echo "  View logs: kubectl logs -f deployment/mieszkaniownik-frontend -n $ENVIRONMENT"
echo "  Check certificate: kubectl get certificate -n $ENVIRONMENT"
echo "  Rollback: ./scripts/rollback.sh $ENVIRONMENT"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  Full deployment guide: DEPLOYMENT.md"
echo "  Scripts documentation: scripts/README.md"
echo ""
echo -e "${GREEN}Happy deploying! ${NC}"
