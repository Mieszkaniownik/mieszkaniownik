#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Deploying frontend to $ENVIRONMENT environment..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$ENVIRONMENT" == "production" ]; then
    CLUSTER_NAME="mieszkaniownik-prod-cluster"
    CLUSTER_ZONE="europe-central2-a"
    NAMESPACE="production"
    VALUES_FILE="values-prod.yaml"
else
    CLUSTER_NAME="mieszkaniownik-dev-cluster"
    CLUSTER_ZONE="europe-central2-a"
    NAMESPACE="development"
    VALUES_FILE="values-dev.yaml"
fi

echo -e "${YELLOW}Connecting to GKE cluster: $CLUSTER_NAME${NC}"
gcloud container clusters get-credentials $CLUSTER_NAME --zone $CLUSTER_ZONE

if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Failed to connect to cluster${NC}"
    exit 1
fi

echo -e "${GREEN}Connected to cluster${NC}"

echo -e "${YELLOW}Deploying with Helm...${NC}"
cd "$PROJECT_DIR"

helm upgrade --install mieszkaniownik-frontend ./helm-chart-frontend \
    --namespace $NAMESPACE \
    --create-namespace \
    --values ./helm-chart-frontend/values.yaml \
    --values ./helm-chart-frontend/$VALUES_FILE \
    --set frontend.image.tag=$VERSION \
    --wait \
    --timeout 10m

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
else
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}Verifying deployment...${NC}"
kubectl rollout status deployment/mieszkaniownik-frontend -n $NAMESPACE --timeout=5m

echo ""
echo -e "${GREEN}=== Deployment Information ===${NC}"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=mieszkaniownik-frontend
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE

INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
if [ ! -z "$INGRESS_IP" ]; then
    echo ""
    echo -e "${GREEN}Application is available at: https://$INGRESS_IP${NC}"
fi

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
