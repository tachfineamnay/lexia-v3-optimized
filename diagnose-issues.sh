#!/bin/bash

# Script de diagnostic pour LexiaV3
# Identifie les problèmes potentiels d'affichage et de configuration

echo "🔍 Diagnostic de LexiaV3"
echo "======================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérification des fichiers CSS
echo -e "\n${YELLOW}📄 Vérification des fichiers CSS...${NC}"
if [ -f "frontend/src/index.css" ]; then
    echo -e "${GREEN}✓ index.css trouvé${NC}"
    grep -q "@tailwind" frontend/src/index.css && echo -e "${GREEN}✓ Tailwind CSS importé${NC}" || echo -e "${RED}✗ Tailwind CSS non importé${NC}"
else
    echo -e "${RED}✗ index.css manquant${NC}"
fi

# Vérification de la configuration Tailwind
echo -e "\n${YELLOW}⚙️  Vérification de Tailwind...${NC}"
if [ -f "frontend/tailwind.config.js" ]; then
    echo -e "${GREEN}✓ tailwind.config.js trouvé${NC}"
else
    echo -e "${RED}✗ tailwind.config.js manquant${NC}"
fi

# Vérification des dépendances
echo -e "\n${YELLOW}📦 Vérification des dépendances...${NC}"
cd frontend
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json trouvé${NC}"
    grep -q "tailwindcss" package.json && echo -e "${GREEN}✓ TailwindCSS dans les dépendances${NC}" || echo -e "${RED}✗ TailwindCSS manquant${NC}"
    grep -q "vite" package.json && echo -e "${GREEN}✓ Vite dans les dépendances${NC}" || echo -e "${RED}✗ Vite manquant${NC}"
fi

# Vérification du build
echo -e "\n${YELLOW}🏗️  Vérification du build...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Dossier dist trouvé${NC}"
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓ index.html dans dist${NC}"
    else
        echo -e "${RED}✗ index.html manquant dans dist${NC}"
    fi
else
    echo -e "${RED}✗ Dossier dist manquant - Build nécessaire${NC}"
fi

# Vérification Docker
echo -e "\n${YELLOW}🐳 Vérification Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker installé${NC}"
    docker ps | grep -q lexiav3 && echo -e "${GREEN}✓ Conteneurs LexiaV3 en cours d'exécution${NC}" || echo -e "${RED}✗ Conteneurs LexiaV3 non trouvés${NC}"
else
    echo -e "${RED}✗ Docker non installé${NC}"
fi

# Vérification des ports
echo -e "\n${YELLOW}🔌 Vérification des ports...${NC}"
netstat -tuln | grep -q ":3000" && echo -e "${GREEN}✓ Port 3000 (Frontend) actif${NC}" || echo -e "${YELLOW}⚠ Port 3000 inactif${NC}"
netstat -tuln | grep -q ":5000" && echo -e "${GREEN}✓ Port 5000 (Backend) actif${NC}" || echo -e "${YELLOW}⚠ Port 5000 inactif${NC}"

# Recommandations
echo -e "\n${YELLOW}💡 Recommandations :${NC}"
echo "1. Exécutez 'npm install' dans le dossier frontend"
echo "2. Exécutez 'npm run build' pour construire l'application"
echo "3. Redémarrez les conteneurs Docker"
echo "4. Videz le cache du navigateur"
echo "5. Vérifiez les logs : docker logs lexiav3_frontend"

echo -e "\n${GREEN}Diagnostic terminé.${NC}" 