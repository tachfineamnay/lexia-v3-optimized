#!/bin/bash

# Script de déploiement pour LexiaV3 sur serveur de production
echo "🚀 Déploiement de LexiaV3 sur serveur de production..."
echo "-------------------------------------"

# Variables
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
WEBROOT="/home/app.ialexia.fr/public_html"
PROJECT_DIR="/root/LexiaV3"

# Fonction pour afficher les étapes
print_step() {
  echo "📋 $1"
}

# Vérification des prérequis
print_step "Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installation en cours..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    echo "❌ NPM n'est pas installé avec Node.js"
    exit 1
fi

# Aller dans le répertoire du projet
cd $PROJECT_DIR

# Installation des dépendances du frontend
print_step "Installation des dépendances du frontend..."
cd $FRONTEND_DIR
npm install
echo "✅ Dépendances du frontend installées avec succès."

# Build du frontend
print_step "Construction du frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build du frontend réussi."
else
    echo "❌ Échec du build du frontend."
    exit 1
fi

# Retour à la racine du projet
cd ..

# Sauvegarde de l'ancien déploiement
print_step "Sauvegarde de l'ancien déploiement..."
if [ -d "$WEBROOT" ]; then
    cp -r $WEBROOT ${WEBROOT}_backup_$(date +%Y%m%d_%H%M%S)
    echo "✅ Sauvegarde créée."
fi

# Déploiement des fichiers frontend
print_step "Déploiement des fichiers frontend..."
rm -rf $WEBROOT/*
cp -r $FRONTEND_DIR/dist/* $WEBROOT/
echo "✅ Fichiers frontend déployés."

# Configuration des permissions
print_step "Configuration des permissions..."
chown -R app.ialexia.fr:app.ialexia.fr $WEBROOT
chmod -R 755 $WEBROOT
find $WEBROOT -type f -exec chmod 644 {} \;
echo "✅ Permissions configurées."

# Installation des dépendances du backend
print_step "Installation des dépendances du backend..."
cd $BACKEND_DIR
npm install
echo "✅ Dépendances du backend installées."

# Configuration du backend
if [ ! -f ".env" ]; then
    echo "⚠️ Fichier .env non trouvé dans le backend. Création à partir du modèle..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé à partir de .env.example."
        echo "⚠️ N'oubliez pas de configurer les variables d'environnement dans .env"
    fi
fi

# Retour à la racine
cd ..

# Création d'un fichier .htaccess pour les routes React
print_step "Configuration du serveur web..."
cat > $WEBROOT/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public"
</FilesMatch>

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

echo "✅ Configuration du serveur web créée."

# Test de l'installation
print_step "Test de l'installation..."
if [ -f "$WEBROOT/index.html" ]; then
    echo "✅ Fichier index.html présent."
else
    echo "❌ Fichier index.html manquant."
    exit 1
fi

if [ -d "$WEBROOT/assets" ]; then
    echo "✅ Dossier assets présent."
else
    echo "⚠️ Dossier assets manquant - vérifiez le build."
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "-------------------------------------"
echo "📊 Informations de déploiement:"
echo "Frontend déployé dans: $WEBROOT"
echo "URL: https://app.ialexia.fr"
echo "Backend dans: $PROJECT_DIR/$BACKEND_DIR"
echo "-------------------------------------"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Vérifiez que l'application fonctionne sur https://app.ialexia.fr"
echo "2. Configurez les variables d'environnement dans $PROJECT_DIR/$BACKEND_DIR/.env"
echo "3. Démarrez le backend si nécessaire"
echo "-------------------------------------"