# 🚀 Guide de Déploiement LexiaV3 sur Coolify

Ce guide vous accompagne pour déployer efficacement LexiaV3 sur Coolify via GitHub.

## 📋 Prérequis

- Un compte Coolify fonctionnel
- Un repository GitHub avec le code LexiaV3
- Clés API pour les services IA (au minimum OpenAI)
- Noms de domaine configurés (optionnel mais recommandé)

## ⚡ Déploiement Rapide

### 1. Préparation du Repository

```bash
# Cloner le projet
git clone <votre-repo-lexia>
cd LexiaV3-main

# Exécuter le script de préparation
chmod +x deploy-coolify.sh
./deploy-coolify.sh

# Pousser vers GitHub
git add .
git commit -m "Optimisation pour déploiement Coolify"
git push origin main
```

### 2. Configuration dans Coolify

1. **Créer un nouveau projet**
   - Connecter votre repository GitHub
   - Sélectionner "Docker Compose" comme type de déploiement
   - Pointer vers `docker-compose.yml`

2. **Configurer les variables d'environnement**
   
   Copiez ces variables dans Coolify (depuis `.env.coolify.template`) :

   ```env
   NODE_ENV=production
   DB_USER=lexia_admin
   DB_PASSWORD=VotreMotDePasseSecurise123!
   JWT_SECRET=UneCleSecureDe32CaracteresMinimum!
   REFRESH_TOKEN_SECRET=UneAutreCleSecureDe32Caracteres!
   OPENAI_API_KEY=sk-votre-cle-openai-ici
   CORS_ORIGIN=https://votre-domaine-frontend.com
   VITE_API_URL=https://votre-domaine-backend.com
   ```

3. **Configurer les domaines**
   - Frontend : Port 3000
   - Backend : Port 5000
   - Activer HTTPS/SSL

### 3. Déploiement

1. Cliquer sur "Deploy" dans Coolify
2. Attendre la fin du build (~5-10 minutes)
3. Vérifier les services avec les healthchecks

## 🏗️ Architecture de Déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │    MongoDB      │
│   (React/Vite)  │    │  (Node.js/API)  │    │   (Database)    │
│   Port: 3000    │◄──►│   Port: 5000    │◄──►│   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                         ┌─────────────────┐
                         │      Redis      │
                         │     (Cache)     │
                         │   Port: 6379    │
                         └─────────────────┘
```

## 🔧 Variables d'Environnement Détaillées

### Variables Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement d'exécution | `production` |
| `DB_USER` | Utilisateur MongoDB | `lexia_admin` |
| `DB_PASSWORD` | Mot de passe MongoDB | `VotreMotDePasse123!` |
| `JWT_SECRET` | Clé secrète JWT (32+ chars) | `UneCleSecureDe32Caracteres!` |
| `REFRESH_TOKEN_SECRET` | Clé refresh token (32+ chars) | `UneAutreCleSecure32Chars!` |
| `OPENAI_API_KEY` | Clé API OpenAI | `sk-...` |
| `CORS_ORIGIN` | Domaine frontend autorisé | `https://app.lexia.com` |
| `VITE_API_URL` | URL du backend | `https://api.lexia.com` |

### Variables Optionnelles

| Variable | Description | Défaut |
|----------|-------------|--------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic Claude | Non configuré |
| `GOOGLE_AI_API_KEY` | Clé API Google Gemini | Non configuré |
| `EMAIL_HOST` | Serveur SMTP | Non configuré |
| `EMAIL_PORT` | Port SMTP | `587` |
| `EMAIL_USER` | Utilisateur email | Non configuré |
| `EMAIL_PASS` | Mot de passe email | Non configuré |

## 🏥 Monitoring et Santé

### Endpoints de Santé

- **Basique**: `GET /api/health`
  ```json
  {
    "uptime": 3600,
    "message": "OK",
    "timestamp": 1703123456789,
    "environment": "production",
    "version": "1.0.0",
    "services": {
      "api": "healthy",
      "database": "healthy",
      "redis": "configured",
      "ai": "configured: openai, anthropic"
    }
  }
  ```

- **Détaillé**: `GET /api/health/detailed`
  - Informations système détaillées
  - Statistiques de base de données
  - Utilisation mémoire et CPU

### Monitoring dans Coolify

1. **Métriques automatiques**
   - CPU et mémoire
   - Trafic réseau
   - Logs en temps réel

2. **Alertes configurables**
   - Downtime detection
   - Resource usage alerts
   - Custom health check monitoring

## 🔒 Sécurité

### Checklist de Sécurité

- [ ] Tous les mots de passe par défaut changés
- [ ] Clés JWT sécurisées (32+ caractères)
- [ ] HTTPS activé sur tous les domaines
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Logs de sécurité configurés

### Configuration HTTPS

Coolify gère automatiquement SSL/TLS avec Let's Encrypt :
1. Ajouter vos domaines dans Coolify
2. Activer "Force HTTPS"
3. Vérifier les certificats SSL

## 🛠️ Dépannage

### Problèmes Courants

#### 1. Erreur de Connexion Base de Données
```bash
# Vérifier les logs MongoDB
docker logs lexia-mongodb

# Vérifier la connectivité
docker exec lexia-backend curl mongodb:27017
```

#### 2. Frontend ne Charge Pas
```bash
# Vérifier les variables d'environnement
echo $VITE_API_URL
echo $CORS_ORIGIN

# Vérifier les logs frontend
docker logs lexia-frontend
```

#### 3. Services IA Non Fonctionnels
```bash
# Vérifier les clés API dans les logs
docker logs lexia-backend | grep -i "openai\|api\|key"

# Tester l'endpoint AI
curl -X POST https://votre-backend/api/ai/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"prompt": "test"}'
```

### Commandes Utiles

```bash
# Redémarrer tous les services
docker-compose restart

# Voir les logs en temps réel
docker-compose logs -f

# Vérifier l'état des conteneurs
docker ps

# Nettoyer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## 📊 Performance

### Optimisations Incluses

1. **Docker Multi-stage builds**
   - Réduction de la taille des images
   - Séparation build/runtime
   - Optimisation des layers

2. **Nginx optimisé**
   - Compression gzip
   - Cache headers
   - Static file serving

3. **Node.js production**
   - Variables d'environnement optimisées
   - Process management
   - Memory limits

### Recommandations de Ressources

- **Minimum**: 2 CPU, 4GB RAM
- **Recommandé**: 4 CPU, 8GB RAM
- **Stockage**: 20GB minimum (données + logs)

## 🔄 Mises à Jour

### Auto-déploiement

Coolify peut redéployer automatiquement à chaque push sur `main` :

1. Activer "Auto Deploy" dans Coolify
2. Configurer les webhooks GitHub
3. Chaque commit déclenche un nouveau déploiement

### Déploiement Manuel

```bash
# Dans Coolify, cliquer sur "Redeploy"
# Ou utiliser l'API Coolify
curl -X POST "https://your-coolify.com/api/projects/{id}/deploy" \
  -H "Authorization: Bearer your-coolify-token"
```

## 📞 Support

### Ressources

- **Documentation Coolify**: [coolify.io/docs](https://coolify.io/docs)
- **GitHub Issues**: [votre-repo/issues](https://github.com/votre-repo/issues)
- **Logs Application**: `/api/health/detailed`

### Contacts

- **Équipe Technique**: tech@lexia.com
- **Support Utilisateurs**: support@lexia.com

---

## ✅ Checklist de Déploiement

- [ ] Repository GitHub configuré
- [ ] Variables d'environnement définies dans Coolify
- [ ] Domaines configurés et SSL activé
- [ ] Healthchecks fonctionnels (`/api/health`)
- [ ] Tests de fonctionnalités principales
- [ ] Monitoring et alertes configurés
- [ ] Sauvegardes automatiques activées
- [ ] Documentation équipe mise à jour

**🎉 Félicitations ! LexiaV3 est maintenant déployé sur Coolify !**