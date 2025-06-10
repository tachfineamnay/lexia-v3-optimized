# Script de déploiement local pour LexiaV3 (Windows PowerShell)
# Auteur: DevOps Senior
# Description: Build du frontend et préparation pour déploiement sur OpenLiteSpeed/CyberPanel

param(
    [switch]$Clean = $false,
    [switch]$Verbose = $false
)

# Configuration des couleurs
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Variables
$FrontendDir = ".\frontend"
$DeployDir = "..\deploy-ready"
$DistDir = "$FrontendDir\dist"

Write-Info "🚀 Début du processus de déploiement local pour LexiaV3"

# Vérification que nous sommes dans le bon répertoire
if (-not (Test-Path $FrontendDir)) {
    Write-Error "Dossier frontend non trouvé. Assurez-vous d'être à la racine du projet LexiaV3."
    exit 1
}

if (-not (Test-Path "$FrontendDir\package.json")) {
    Write-Error "package.json non trouvé dans le dossier frontend."
    exit 1
}

# Étape 1: Nettoyage si demandé
if ($Clean) {
    Write-Info "🧹 Nettoyage des fichiers temporaires..."
    if (Test-Path "$FrontendDir\dist") {
        Remove-Item "$FrontendDir\dist" -Recurse -Force
    }
    if (Test-Path "$FrontendDir\node_modules\.vite") {
        Remove-Item "$FrontendDir\node_modules\.vite" -Recurse -Force
    }
}

# Étape 2: Installation des dépendances
Write-Info "📦 Vérification des dépendances npm..."
Set-Location $FrontendDir

if (-not (Test-Path "node_modules")) {
    Write-Info "Installation des dépendances npm..."
    npm ci --production=false
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Échec de l'installation des dépendances."
        exit 1
    }
} else {
    Write-Info "Les dépendances sont déjà installées."
}

# Étape 3: Build du frontend
Write-Info "🔨 Build du frontend avec Vite..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Le build a échoué."
    exit 1
}

# Vérification que le build s'est bien passé
if (-not (Test-Path "dist")) {
    Write-Error "Le build a échoué. Dossier dist non créé."
    exit 1
}

# Étape 4: Préparation du dossier de déploiement
Set-Location ..  # Retour à la racine du projet

Write-Info "📁 Préparation du dossier de déploiement..."

# Suppression de l'ancien dossier deploy-ready s'il existe
if (Test-Path $DeployDir) {
    Write-Warning "Suppression de l'ancien dossier deploy-ready..."
    Remove-Item $DeployDir -Recurse -Force
}

# Création du nouveau dossier deploy-ready
New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null

# Étape 5: Copie des fichiers de build
Write-Info "📋 Copie des fichiers de build..."

# Copie UNIQUEMENT le contenu du dossier dist
Copy-Item "$DistDir\*" -Destination $DeployDir -Recurse -Force

# Vérification que les fichiers essentiels sont présents
if (-not (Test-Path "$DeployDir\index.html")) {
    Write-Error "Fichier index.html manquant dans le dossier de déploiement."
    exit 1
}

# Étape 6: Affichage des statistiques
Write-Info "📊 Statistiques du build:"
$DeploySize = (Get-ChildItem $DeployDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$FileCount = (Get-ChildItem $DeployDir -Recurse -File).Count
Write-Host "   - Taille du dossier deploy-ready: $([math]::Round($DeploySize, 2)) MB"
Write-Host "   - Nombre de fichiers: $FileCount"
Write-Host "   - Fichiers principaux:"
Get-ChildItem $DeployDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

# Étape 7: Création d'un fichier .htaccess pour OpenLiteSpeed
Write-Info "⚙️  Création du fichier .htaccess pour OpenLiteSpeed..."

$HtaccessContent = @"
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
"@

$HtaccessContent | Out-File -FilePath "$DeployDir\.htaccess" -Encoding UTF8

Write-Success "✅ Déploiement local terminé avec succès!"
Write-Info "📂 Les fichiers prêts pour le déploiement sont dans: $DeployDir"
Write-Info "🌐 Prochaines étapes:"
Write-Host "   1. Uploadez le CONTENU du dossier deploy-ready vers /home/app.ialexia.fr/public_html/"
Write-Host "   2. Assurez-vous que les permissions sont correctes (644 pour les fichiers, 755 pour les dossiers)"
Write-Host "   3. Vérifiez que le fichier .htaccess est bien uploadé"
Write-Host ""
Write-Info "📖 Consultez README_DEPLOY.md pour les instructions détaillées."

# Pause pour permettre la lecture des résultats
if ($Verbose) {
    Write-Host "Appuyez sur une touche pour continuer..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 