#!/bin/bash

# Script de déploiement rapide pour LexiaV3
# Ce script met à jour l'application avec les dernières modifications

set -e

echo "🚀 Déploiement rapide de LexiaV3..."

# Configuration
APP_DIR="/home/LexiaV3/public_html"
BACKUP_DIR="/home/LexiaV3/backups"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📦 Mise à jour du code depuis GitHub...${NC}"
cd $APP_DIR
git pull origin master

echo -e "${YELLOW}🔧 Installation des dépendances frontend...${NC}"
cd $APP_DIR/frontend
npm install

echo -e "${YELLOW}🏗️  Construction du frontend...${NC}"
npm run build

echo -e "${YELLOW}🐳 Redémarrage des conteneurs Docker...${NC}"
cd $APP_DIR
docker-compose -f LexiaV3-docker-compose.yml down
docker-compose -f LexiaV3-docker-compose.yml up -d --build

echo -e "${YELLOW}🧹 Nettoyage du cache...${NC}"
docker exec -it lexiav3_frontend sh -c "rm -rf /app/node_modules/.cache" || true
docker exec -it lexiav3_frontend sh -c "rm -rf /app/dist/.cache" || true

echo -e "${YELLOW}🔄 Redémarrage des services...${NC}"
docker restart lexiav3_frontend lexiav3_backend

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}🌐 L'application est accessible sur https://app.lexiav3.ai${NC}"

# Vérification du statut
echo -e "\n${YELLOW}📊 Statut des conteneurs :${NC}"
docker ps | grep lexiav3

echo -e "\n${YELLOW}💡 Conseils :${NC}"
echo "- Videz le cache de votre navigateur (Ctrl+F5)"
echo "- Vérifiez les logs : docker logs lexiav3_frontend"
echo "- En cas de problème SSL, utilisez : certbot renew --force-renewal"