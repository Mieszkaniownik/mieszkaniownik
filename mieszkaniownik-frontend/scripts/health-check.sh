#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
NAMESPACE=$ENVIRONMENT

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Running health checks for $ENVIRONMENT environment..."
echo ""

CURRENT_CONTEXT=$(kubectl config current-context)
echo -e "${YELLOW}Current context: $CURRENT_CONTEXT${NC}"
echo ""

echo -e "${YELLOW}Checking pods...${NC}"
PODS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=mieszkaniownik-frontend --no-headers)
if [ -z "$PODS" ]; then
    echo -e "${RED}No pods found${NC}"
    exit 1
fi

READY_PODS=$(echo "$PODS" | grep "Running" | grep "1/1" | wc -l)
TOTAL_PODS=$(echo "$PODS" | wc -l)
echo -e "${GREEN}$READY_PODS/$TOTAL_PODS pods ready${NC}"

if [ "$READY_PODS" -lt 2 ] && [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${RED}Insufficient pods running in production (minimum 2 required)${NC}"
fi

echo ""
echo -e "${YELLOW}Checking deployment...${NC}"
DEPLOYMENT_STATUS=$(kubectl get deployment mieszkaniownik-frontend -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Available")].status}')
if [ "$DEPLOYMENT_STATUS" == "True" ]; then
    echo -e "${GREEN}Deployment is available${NC}"
else
    echo -e "${RED}Deployment is not available${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Checking service...${NC}"
SERVICE=$(kubectl get svc mieszkaniownik-frontend -n $NAMESPACE --no-headers 2>/dev/null)
if [ ! -z "$SERVICE" ]; then
    echo -e "${GREEN}Service is running${NC}"
else
    echo -e "${RED}Service not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Checking ingress...${NC}"
INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
if [ ! -z "$INGRESS_IP" ]; then
    echo -e "${GREEN}Ingress has external IP: $INGRESS_IP${NC}"
else
    echo -e "${YELLOW}Ingress IP not yet assigned${NC}"
fi

echo ""
echo -e "${YELLOW}Checking SSL certificate...${NC}"
CERT_READY=$(kubectl get certificate -n $NAMESPACE -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
if [ "$CERT_READY" == "True" ]; then
    echo -e "${GREEN}SSL certificate is ready${NC}"
else
    echo -e "${YELLOW}SSL certificate is not ready yet${NC}"
fi

echo ""
echo -e "${YELLOW}Checking horizontal pod autoscaler...${NC}"
HPA=$(kubectl get hpa -n $NAMESPACE --no-headers 2>/dev/null)
if [ ! -z "$HPA" ]; then
    echo -e "${GREEN}HPA is configured${NC}"
    kubectl get hpa -n $NAMESPACE
else
    echo -e "${YELLOW}HPA not found (may not be enabled)${NC}"
fi

echo ""
echo -e "${YELLOW}Checking resource usage...${NC}"
kubectl top pods -n $NAMESPACE -l app.kubernetes.io/name=mieszkaniownik-frontend 2>/dev/null || echo -e "${YELLOW}⚠ Metrics not available${NC}"

echo ""
echo -e "${YELLOW}Performing HTTP health check...${NC}"
if [ ! -z "$INGRESS_IP" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$INGRESS_IP/health --max-time 10 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}HTTP health check passed (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}HTTP health check failed (HTTP $HTTP_CODE)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}Health check completed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""

if [ "$READY_PODS" -eq 0 ] || [ "$DEPLOYMENT_STATUS" != "True" ]; then
    exit 1
fi
