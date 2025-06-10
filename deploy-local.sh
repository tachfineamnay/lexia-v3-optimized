#!/bin/bash

# Script de déploiement local pour LexiaV3
# Auteur: DevOps Senior
# Description: Build du frontend et préparation pour déploiement sur OpenLiteSpeed/CyberPanel

set -e  # Arrête le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
FRONTEND_DIR="./frontend"
DEPLOY_DIR="../deploy-ready"
DIST_DIR="${FRONTEND_DIR}/dist"

log_info "🚀 Début du processus de déploiement local pour LexiaV3"

# Vérification que nous sommes dans le bon répertoire
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Dossier frontend non trouvé. Assurez-vous d'être à la racine du projet LexiaV3."
    exit 1
fi

if [ ! -f "${FRONTEND_DIR}/package.json" ]; then
    log_error "package.json non trouvé dans le dossier frontend."
    exit 1
fi

# Étape 1: Installation des dépendances (si nécessaire)
log_info "📦 Vérification des dépendances npm..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances npm..."
    npm ci --production=false
else
    log_info "Les dépendances sont déjà installées."
fi

# Étape 2: Build du frontend
log_info "🔨 Build du frontend avec Vite..."
npm run build

# Vérification que le build s'est bien passé
if [ ! -d "dist" ]; then
    log_error "Le build a échoué. Dossier dist non créé."
    exit 1
fi

# Étape 3: Préparation du dossier de déploiement
cd ..  # Retour à la racine du projet

log_info "📁 Préparation du dossier de déploiement..."

# Suppression de l'ancien dossier deploy-ready s'il existe
if [ -d "$DEPLOY_DIR" ]; then
    log_warning "Suppression de l'ancien dossier deploy-ready..."
    rm -rf "$DEPLOY_DIR"
fi

# Création du nouveau dossier deploy-ready
mkdir -p "$DEPLOY_DIR"

# Étape 4: Copie des fichiers de build
log_info "📋 Copie des fichiers de build..."

# Copie UNIQUEMENT le contenu du dossier dist
cp -r "${DIST_DIR}/"* "$DEPLOY_DIR/"

# Vérification que les fichiers essentiels sont présents
if [ ! -f "${DEPLOY_DIR}/index.html" ]; then
    log_error "Fichier index.html manquant dans le dossier de déploiement."
    exit 1
fi

# Étape 5: Affichage des statistiques
log_info "📊 Statistiques du build:"
echo "   - Taille du dossier deploy-ready: $(du -sh "$DEPLOY_DIR" | cut -f1)"
echo "   - Nombre de fichiers: $(find "$DEPLOY_DIR" -type f | wc -l)"
echo "   - Fichiers principaux:"
ls -la "$DEPLOY_DIR" | head -10

# Étape 6: Création d'un fichier .htaccess pour OpenLiteSpeed
log_info "⚙️  Création du fichier .htaccess pour OpenLiteSpeed..."
cat > "${DEPLOY_DIR}/.htaccess" << 'EOF'
# Configuration pour OpenLiteSpeed/CyberPanel
# Optimisations pour application React SPA

# Gestion du cache pour les assets
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    
    # CSS et JS
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType application/x-javascript "access plus 1 year"
    
    # Fonts
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    
    # HTML - Cache court pour permettre les mises à jour
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Compression GZIP
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
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Redirection pour SPA (Single Page Application)
# Toutes les routes doivent pointer vers index.html
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Gestion des fichiers existants (assets, API, etc.)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Exclure les appels API du routage SPA
    RewriteCond %{REQUEST_URI} !^/api
    
    # Rediriger vers index.html pour les routes SPA
    RewriteRule . /index.html [L]
</IfModule>

# Sécurité - Masquer les fichiers sensibles
<Files ~ "^\.">
    Order allow,deny
    Deny from all
</Files>

# Types MIME
AddType application/javascript .js
AddType text/css .css
AddType application/json .json
EOF

log_success "✅ Déploiement local terminé avec succès!"
log_info "📂 Les fichiers prêts pour le déploiement sont dans: $DEPLOY_DIR"
log_info "🌐 Prochaines étapes:"
echo "   1. Uploadez le CONTENU du dossier deploy-ready vers /home/app.ialexia.fr/public_html/"
echo "   2. Assurez-vous que les permissions sont correctes (644 pour les fichiers, 755 pour les dossiers)"
echo "   3. Vérifiez que le fichier .htaccess est bien uploadé"
echo ""
log_info "📖 Consultez README_DEPLOY.md pour les instructions détaillées." 