#!/bin/bash

# Script de déploiement pour LexiaV3
# Ce script automatise le processus de déploiement de l'application

# Affichage des informations
echo "🚀 Déploiement de LexiaV3 en cours..."
echo "-------------------------------------"

# Variables
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
LOGS_DIR="logs"

# Création du dossier de logs s'il n'existe pas
mkdir -p $LOGS_DIR

# Fonction pour afficher les étapes
print_step() {
  echo "📋 $1"
}

# Vérification des prérequis
print_step "Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js (version 14+)."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ NPM n'est pas installé. Veuillez installer NPM."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker n'est pas installé. Le déploiement Docker ne sera pas disponible."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

# Installation des dépendances du frontend
print_step "Installation des dépendances du frontend..."
cd $FRONTEND_DIR
npm install --quiet
echo "✅ Dépendances du frontend installées avec succès."

# Build du frontend
print_step "Construction du frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build du frontend réussi."
else
    echo "❌ Échec du build du frontend. Vérifiez les logs pour plus de détails."
    exit 1
fi

# Retour à la racine du projet
cd ..

# Installation des dépendances du backend
print_step "Installation des dépendances du backend..."
cd $BACKEND_DIR
npm install --quiet
echo "✅ Dépendances du backend installées avec succès."

# Vérification de la configuration du backend
if [ ! -f ".env" ]; then
    echo "⚠️ Fichier .env non trouvé dans le backend. Création à partir du modèle..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé à partir de .env.example."
    else
        echo "❌ Fichier .env.example non trouvé. Veuillez créer manuellement un fichier .env."
        exit 1
    fi
fi

# Retour à la racine du projet
cd ..

# Déploiement avec Docker si disponible
if [ "$DOCKER_AVAILABLE" = true ]; then
    print_step "Déploiement avec Docker..."
    docker-compose down
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo "✅ Déploiement Docker réussi."
    else
        echo "❌ Échec du déploiement Docker. Vérifiez les logs pour plus de détails."
        exit 1
    fi
else
    print_step "Démarrage des services en mode développement..."
    echo "Pour démarrer le frontend: cd $FRONTEND_DIR && npm run dev"
    echo "Pour démarrer le backend: cd $BACKEND_DIR && npm start"
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "-------------------------------------"
echo "📊 Accès à l'application:"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000/api"
echo "-------------------------------------"
