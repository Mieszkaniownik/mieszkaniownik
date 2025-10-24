#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up GKE cluster for $ENVIRONMENT environment..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$ENVIRONMENT" == "production" ]; then
    CLUSTER_NAME="mieszkaniownik-prod-cluster"
    CLUSTER_ZONE="europe-central2-a"
    NAMESPACE="production"
else
    CLUSTER_NAME="mieszkaniownik-dev-cluster"
    CLUSTER_ZONE="europe-central2-a"
    NAMESPACE="development"
fi

echo -e "${YELLOW}Connecting to GKE cluster: $CLUSTER_NAME${NC}"
gcloud container clusters get-credentials $CLUSTER_NAME --zone $CLUSTER_ZONE

echo -e "${YELLOW}Creating namespace: $NAMESPACE${NC}"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo -e "${YELLOW}Installing Nginx Ingress Controller...${NC}"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --set controller.replicaCount=2 \
    --set controller.nodeSelector."kubernetes\.io/os"=linux \
    --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux \
    --set controller.service.annotations."cloud\.google\.com/load-balancer-type"="External" \
    --set controller.metrics.enabled=true \
    --set controller.podAnnotations."prometheus\.io/scrape"="true" \
    --set controller.podAnnotations."prometheus\.io/port"="10254"

echo -e "${YELLOW}Installing cert-manager...${NC}"
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm upgrade --install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true

echo -e "${YELLOW}Waiting for cert-manager to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: mieszkaniownik@gmail.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: mieszkaniownik@gmail.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

echo -e "${YELLOW}Applying Kubernetes infrastructure...${NC}"
kubectl apply -f "$PROJECT_DIR/k8s-infrastructure.yaml"

echo -e "${YELLOW}Installing metrics-server...${NC}"
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo -e "${YELLOW}Creating image pull secret...${NC}"
if [ -f "$HOME/.docker/config.json" ]; then
    kubectl create secret generic registry-secret \
        --from-file=.dockerconfigjson="$HOME/.docker/config.json" \
        --type=kubernetes.io/dockerconfigjson \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
fi

echo -e "${YELLOW}Setting up cache sync CronJob...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cache-sync
  namespace: $NAMESPACE
spec:
  schedule: "0 2 * * *"  # Run at 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cache-sync
            image: google/cloud-sdk:alpine
            command:
            - /bin/sh
            - -c
            - |
              echo "Starting cache synchronization..."
              # Add your cache sync logic here
              # For example: sync static assets to Cloud Storage
              echo "Cache sync completed"
          restartPolicy: OnFailure
EOF

echo -e "${GREEN}GKE cluster setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure your domain DNS to point to the ingress IP"
echo "2. Run: kubectl get svc -n ingress-nginx to get the external IP"
echo "3. Deploy your application: ./deploy.sh $ENVIRONMENT"
