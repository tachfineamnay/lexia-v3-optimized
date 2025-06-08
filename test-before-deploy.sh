#!/bin/bash
# Script de test avant déploiement pour éviter les erreurs sur le VPS

echo "🔍 Test pré-déploiement LexiaV3..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur d'erreurs
ERRORS=0

# 1. Vérifier la syntaxe des Dockerfiles
echo -e "\n📋 Vérification des Dockerfiles..."
if grep -q "^+" backend/Dockerfile; then
    echo -e "${RED}❌ Erreur: backend/Dockerfile contient des lignes invalides commençant par +${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ backend/Dockerfile est valide${NC}"
fi

if grep -q "^+" frontend/Dockerfile 2>/dev/null; then
    echo -e "${RED}❌ Erreur: frontend/Dockerfile contient des lignes invalides commençant par +${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ frontend/Dockerfile est valide${NC}"
fi

# 2. Vérifier les imports de modules
echo -e "\n📋 Vérification des imports..."
cd backend
MISSING_MODULES=()

# Vérifier si tous les modèles importés existent
for file in routes/*.js; do
    # Extraire les imports de modèles
    IMPORTS=$(grep -E "require\(['\"]\.\.\/models\/" "$file" 2>/dev/null | sed -E "s/.*require\(['\"]\.\.\/models\/([^'\"]+)['\"].*/\1/")
    for import in $IMPORTS; do
        MODEL_FILE="models/${import}.js"
        if [ ! -f "$MODEL_FILE" ]; then
            echo -e "${RED}❌ Erreur: $file importe '$MODEL_FILE' qui n'existe pas${NC}"
            MISSING_MODULES+=("$MODEL_FILE")
            ((ERRORS++))
        fi
    done
done

# 3. Vérifier les dépendances npm
echo -e "\n📋 Vérification des dépendances npm..."
cd ../backend

# Vérifier si package.json est valide
if ! node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null; then
    echo -e "${RED}❌ Erreur: backend/package.json n'est pas un JSON valide${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ backend/package.json est valide${NC}"
fi

cd ../frontend
if ! node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null; then
    echo -e "${RED}❌ Erreur: frontend/package.json n'est pas un JSON valide${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ frontend/package.json est valide${NC}"
fi

cd ..

# 4. Vérifier docker-compose.yml
echo -e "\n📋 Vérification de docker-compose.yml..."
if command -v docker-compose &> /dev/null; then
    if docker-compose config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ docker-compose.yml est valide${NC}"
    else
        echo -e "${RED}❌ Erreur: docker-compose.yml contient des erreurs${NC}"
        docker-compose config
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose non installé, impossible de vérifier docker-compose.yml${NC}"
fi

# 5. Vérifier les variables d'environnement requises
echo -e "\n📋 Vérification du fichier .env..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé (sera nécessaire sur le VPS)${NC}"
    echo -e "Variables requises:"
    echo -e "  - JWT_SECRET"
    echo -e "  - REFRESH_TOKEN_SECRET"
    echo -e "  - MONGODB_URI"
else
    # Vérifier les variables requises
    REQUIRED_VARS=("JWT_SECRET" "REFRESH_TOKEN_SECRET" "MONGODB_URI")
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" .env; then
            echo -e "${RED}❌ Erreur: Variable $var manquante dans .env${NC}"
            ((ERRORS++))
        fi
    done
fi

# 6. Test de build Docker local (optionnel)
if [ "$1" == "--with-docker" ]; then
    echo -e "\n📋 Test de build Docker..."
    if docker build -t test-backend backend/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build backend réussi${NC}"
        docker rmi test-backend > /dev/null 2>&1
    else
        echo -e "${RED}❌ Erreur: Build backend échoué${NC}"
        ((ERRORS++))
    fi
    
    if docker build -t test-frontend frontend/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build frontend réussi${NC}"
        docker rmi test-frontend > /dev/null 2>&1
    else
        echo -e "${RED}❌ Erreur: Build frontend échoué${NC}"
        ((ERRORS++))
    fi
fi

# Résumé
echo -e "\n==============================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés!${NC}"
    echo -e "${GREEN}L'application est prête à être déployée.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)!${NC}"
    echo -e "${RED}Corrigez ces erreurs avant de déployer.${NC}"
    exit 1
fi 