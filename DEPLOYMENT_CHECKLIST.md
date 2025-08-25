# ✅ Checklist de Déploiement Coolify - LexiaV3

## 🎯 Étapes de Vérification Avant Push

### 1. 🔧 Configuration Coolify
- [ ] **Application créée** dans Coolify
- [ ] **Repository connecté** : `tachfineamnay/lexia-v3-optimized`
- [ ] **Branche configurée** : `main`
- [ ] **Auto-deployment activé**

### 2. 🏗️ Services Configurés
- [ ] **Frontend Service** (React/Vite)
  - Port: 80 (Nginx)
  - Domaine: `lexia.votre-domaine.com`
- [ ] **Backend Service** (Node.js)
  - Port: 5000
  - Domaine: `api-lexia.votre-domaine.com`
- [ ] **MongoDB Service**
  - Port: 27017
  - Volume persistent configuré
- [ ] **Redis Service**
  - Port: 6379
  - Volume persistent configuré

### 3. 🌐 Variables d'Environnement Coolify
```bash
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://lexia:password@mongodb:27017/lexia_v4?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=votre-jwt-secret-fort
REFRESH_TOKEN_SECRET=votre-refresh-secret-fort
OPENAI_API_KEY=votre-cle-openai
FRONTEND_URL=https://lexia.votre-domaine.com

# Frontend
VITE_API_URL=https://api-lexia.votre-domaine.com
```

### 4. 🔐 Secrets GitHub
- [ ] **COOLIFY_WEBHOOK_URL** configuré
- [ ] **FRONTEND_URL** configuré
- [ ] **BACKEND_URL** configuré

### 5. 📁 Fichiers de Configuration
- [ ] `coolify.json` présent et configuré
- [ ] `docker-compose.yml` optimisé
- [ ] Dockerfiles multi-stage en place
- [ ] `.dockerignore` configurés

## 🚀 Test de Déploiement

### Commandes de Déploiement
```bash
# 1. Vérifier les changements
git status

# 2. Ajouter les modifications
git add .

# 3. Commit avec message descriptif
git commit -m "🚀 Deploy to Coolify - Ready for production

✅ All services configured
✅ Environment variables set
✅ Secrets configured
✅ Domain names ready"

# 4. Push vers GitHub (déclenche le déploiement)
git push origin main
```

### 🔍 Monitoring du Déploiement

#### Sur GitHub Actions :
1. **Aller sur** : `https://github.com/tachfineamnay/lexia-v3-optimized/actions`
2. **Vérifier le workflow** : "🚀 Deploy to Coolify"
3. **Suivre les étapes** :
   - ✅ Run Tests
   - ✅ Build Docker Images
   - ✅ Deploy to Coolify
   - ✅ Post-deployment Tests

#### Sur Coolify :
1. **Vérifier les logs** de déploiement
2. **Contrôler l'état** des services
3. **Tester les URLs** configurées

## 🧪 Tests Post-Déploiement

### Tests Automatiques
Le script `test-deployment.sh` teste automatiquement :
- ✅ Accessibilité frontend
- ✅ API backend fonctionnelle
- ✅ Connexion base de données
- ✅ Services AI configurés
- ✅ Sécurité de base

### Tests Manuels
```bash
# Test Frontend
curl -I https://lexia.votre-domaine.com

# Test Backend API
curl https://api-lexia.votre-domaine.com/api/health

# Test avec données
curl -X POST https://api-lexia.votre-domaine.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

## 🚨 Dépannage

### Si le Déploiement Échoue :

#### 1. Vérifier GitHub Actions
- Consulter les logs détaillés
- Vérifier les secrets configurés
- Contrôler les permissions

#### 2. Vérifier Coolify
- Logs de déploiement
- État des services
- Configuration des domaines
- Variables d'environnement

#### 3. Vérifier Connectivité
```bash
# Test webhook Coolify
curl -X POST $COOLIFY_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📞 Support

### Logs Importants
- **GitHub Actions** : Logs complets du workflow
- **Coolify** : Logs de déploiement et services
- **Application** : Logs runtime des containers

### Commandes Utiles
```bash
# Vérifier l'état local
npm run health:check

# Tests local
npm test

# Build local
npm run build

# Nettoyage
npm run clean
```

## 🎉 Succès !

Si tous les tests passent :
- ✅ Application accessible publiquement
- ✅ API fonctionnelle
- ✅ Base de données connectée
- ✅ Services AI opérationnels
- ✅ Monitoring actif

**Votre LexiaV3 est maintenant déployé en production !** 🚀