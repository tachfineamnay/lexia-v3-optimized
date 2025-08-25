# 🔐 Configuration des Secrets GitHub pour Coolify

## Secrets Requis

Pour que le déploiement automatique fonctionne, vous devez configurer ces secrets dans votre repository GitHub :

### 1. 🔗 `COOLIFY_WEBHOOK_URL`
**Description** : URL de webhook fournie par Coolify pour déclencher le déploiement
**Format** : `https://votre-serveur-coolify.com/api/v1/deploy/webhook/votre-token`
**Où le trouver** : Dans l'interface Coolify → Votre application → Settings → Webhooks

### 2. 🌐 `FRONTEND_URL`
**Description** : URL publique de votre frontend déployé
**Format** : `https://lexia.votre-domaine.com`
**Utilisation** : Tests post-déploiement

### 3. 🔧 `BACKEND_URL`
**Description** : URL publique de votre backend API
**Format** : `https://api-lexia.votre-domaine.com`
**Utilisation** : Tests post-déploiement

## 📋 Étapes de Configuration

### Sur GitHub :
1. Allez sur votre repository `lexia-v3-optimized`
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret un par un

### Sur Coolify :
1. **Créer une nouvelle application**
2. **Connecter au repository GitHub** `tachfineamnay/lexia-v3-optimized`
3. **Configurer les services** :
   - Frontend (React/Vite)
   - Backend (Node.js/Express)
   - MongoDB
   - Redis
4. **Récupérer l'URL de webhook** générée
5. **Configurer les domaines**

## 🚀 Test de Configuration

Une fois configuré, poussez un commit vers la branche `main` :

```bash
git add .
git commit -m "🚀 Enable Coolify deployment"
git push origin main
```

Le workflow devrait :
1. ✅ Exécuter les tests
2. ✅ Builder les images Docker
3. ✅ Déclencher le déploiement Coolify
4. ✅ Lancer les tests post-déploiement

## 🔍 Vérification

Vérifiez que votre configuration fonctionne :

- [ ] Repository GitHub connecté à Coolify
- [ ] Secrets GitHub configurés
- [ ] Domaines configurés dans Coolify
- [ ] Variables d'environnement définies
- [ ] Services démarrés dans Coolify

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs GitHub Actions
2. Les logs Coolify
3. La connectivité webhook
4. Les permissions repository