# 🚀 Guide de Déploiement LexiaV3

## Vue d'ensemble

Ce guide explique comment déployer l'application frontend React de LexiaV3 sur un serveur VPS avec OpenLiteSpeed/CyberPanel.

**⚠️ IMPORTANT**: Seuls les fichiers buildés (statiques) doivent être uploadés sur le serveur. Ne jamais uploader le code source, node_modules, ou le dossier frontend complet.

## 📋 Prérequis

- Node.js 18+ installé localement
- npm ou yarn
- Accès SSH ou FTP au serveur
- Domaine configuré (app.ialexia.fr)

## 🔨 1. Build du Frontend en Local

### Installation des dépendances

```bash
# Se placer dans le dossier frontend
cd frontend

# Installation des dépendances
npm install
# ou
npm ci --production=false
```

### Variables d'environnement

Créez un fichier `.env.production` dans le dossier `frontend/` si nécessaire :

```env
# URL de l'API backend (à adapter selon votre configuration)
VITE_API_URL=https://api.ialexia.fr
VITE_APP_NAME=LexiaV3
```

### Build de production

```bash
# Dans le dossier frontend
npm run build
```

Cette commande génère un dossier `dist/` contenant tous les fichiers statiques optimisés.

### ✅ Vérification du build

Après le build, vérifiez que le dossier `dist/` contient :
- `index.html` (fichier principal)
- `assets/` (dossier avec CSS, JS, images)
- `vite.svg` (favicon)

## 🚀 2. Déploiement Automatisé (Recommandé)

### Utilisation du script deploy-local.sh

```bash
# À la racine du projet LexiaV3
./deploy-local.sh
```

Ce script :
1. ✅ Vérifie les dépendances
2. 🔨 Build le frontend
3. 📁 Crée un dossier `../deploy-ready/`
4. 📋 Copie UNIQUEMENT le contenu de `dist/`
5. ⚙️ Ajoute un fichier `.htaccess` optimisé
6. 📊 Affiche les statistiques

### Sur Windows

```powershell
# Utiliser Git Bash ou WSL
bash deploy-local.sh

# Ou exécuter manuellement les étapes
cd frontend
npm run build
mkdir ..\deploy-ready
copy dist\* ..\deploy-ready\ /s
```

## 📤 3. Upload vers le Serveur

### 🎯 Destination sur le serveur

```
/home/app.ialexia.fr/public_html/
```

### Méthodes d'upload

#### Option A: FTP/SFTP (FileZilla, WinSCP)

1. Connectez-vous à votre serveur via FTP/SFTP
2. Naviguez vers `/home/app.ialexia.fr/public_html/`
3. **Supprimez tout le contenu existant** (sauf .htaccess si personnalisé)
4. Uploadez **UNIQUEMENT le CONTENU** du dossier `deploy-ready/`

#### Option B: SSH/SCP

```bash
# Upload via SCP
scp -r ../deploy-ready/* user@votre-serveur.com:/home/app.ialexia.fr/public_html/

# Ou via rsync (recommandé)
rsync -avz --delete ../deploy-ready/ user@votre-serveur.com:/home/app.ialexia.fr/public_html/
```

#### Option C: CyberPanel File Manager

1. Connectez-vous à CyberPanel
2. Allez dans "File Manager"
3. Naviguez vers `/home/app.ialexia.fr/public_html/`
4. Supprimez les anciens fichiers
5. Uploadez les nouveaux fichiers

## ⚙️ 4. Configuration du Serveur

### Permissions des fichiers

```bash
# Sur le serveur (via SSH)
cd /home/app.ialexia.fr/public_html/
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chown -R app.ialexia.fr:app.ialexia.fr .
```

### Configuration OpenLiteSpeed

Le fichier `.htaccess` inclus configure automatiquement :
- ✅ Routage SPA (Single Page Application)
- 🗜️ Compression GZIP
- 📦 Cache des assets statiques
- 🛡️ Sécurité de base

### Vérification DNS

Assurez-vous que le domaine pointe vers votre serveur :

```bash
nslookup app.ialexia.fr
```

## 🔍 5. Tests Post-Déploiement

### Tests essentiels

1. **Accès principal**: https://app.ialexia.fr
2. **Routage SPA**: https://app.ialexia.fr/login (ne doit pas donner 404)
3. **Assets**: Vérifiez que CSS/JS se chargent
4. **API**: Testez les appels vers le backend

### Outils de test

```bash
# Test de vitesse
curl -w "@curl-format.txt" -o /dev/null -s "https://app.ialexia.fr"

# Test de compression
curl -I -H "Accept-Encoding: gzip" https://app.ialexia.fr

# Test des headers de cache
curl -I https://app.ialexia.fr/assets/
```

## 🚨 6. Dépannage

### Problèmes courants

#### 404 sur les routes

**Cause**: `.htaccess` mal configuré ou mod_rewrite désactivé

**Solution**:
```apache
# Vérifiez que cette ligne est dans .htaccess
RewriteRule . /index.html [L]
```

#### Erreurs 500

**Cause**: Permissions incorrectes ou .htaccess mal formé

**Solution**:
1. Vérifiez les permissions (644/755)
2. Testez sans .htaccess temporairement

#### Assets 404

**Cause**: Chemins incorrects dans la config Vite

**Solution**: Vérifiez `base: '/'` dans `vite.config.js`

#### CORS sur API

**Cause**: URL d'API incorrecte

**Solution**: Vérifiez `VITE_API_URL` dans le build

### Logs utiles

```bash
# Logs OpenLiteSpeed
tail -f /usr/local/lsws/logs/error.log
tail -f /usr/local/lsws/logs/access.log

# Logs domaine spécifique
tail -f /home/app.ialexia.fr/logs/access.log
tail -f /home/app.ialexia.fr/logs/error.log
```

## 🔄 7. Processus de Mise à Jour

### Mise à jour standard

1. Modifiez le code frontend
2. Exécutez `./deploy-local.sh`
3. Uploadez le nouveau contenu de `deploy-ready/`
4. Videz le cache du navigateur (Ctrl+F5)

### Mise à jour avec conservation de données

```bash
# Sauvegarde des fichiers de config personnalisés si nécessaire
scp user@serveur:/home/app.ialexia.fr/public_html/.htaccess ./backup-htaccess

# Déploiement normal
./deploy-local.sh

# Upload avec préservation de certains fichiers
rsync -avz --exclude='.htaccess' ../deploy-ready/ user@serveur:/home/app.ialexia.fr/public_html/
```

## 📁 8. Structure des Fichiers Déployés

```
/home/app.ialexia.fr/public_html/
├── index.html              # Point d'entrée principal
├── .htaccess              # Configuration serveur
├── vite.svg               # Favicon
└── assets/                # Assets optimisés
    ├── css/
    │   └── index-[hash].css
    ├── js/
    │   ├── index-[hash].js
    │   ├── react-vendor-[hash].js
    │   ├── router-[hash].js
    │   ├── utils-[hash].js
    │   └── ui-libs-[hash].js
    └── images/
        └── [optimized-images]
```

## ✅ 9. Checklist de Déploiement

- [ ] Build local réussi (`npm run build`)
- [ ] Script `deploy-local.sh` exécuté
- [ ] Contenu de `deploy-ready/` uploadé
- [ ] Permissions correctes (644/755)
- [ ] `.htaccess` présent et correct
- [ ] Test d'accès principal (/)
- [ ] Test du routage SPA (/login, /register)
- [ ] Test des assets (CSS/JS chargés)
- [ ] Test de l'intégration API
- [ ] Test sur mobile/tablet
- [ ] Cache navigateur vidé

## 📞 Support

En cas de problème :

1. Vérifiez les logs serveur
2. Testez en local avec `npm run preview`
3. Validez la configuration DNS
4. Contactez l'équipe DevOps si nécessaire

---

**Note**: Ce guide est spécifique au déploiement statique. Pour un déploiement avec SSR ou des besoins spécifiques, consultez la documentation avancée. 