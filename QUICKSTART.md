# 🚀 Guide de démarrage rapide - Lexia V4

## 📋 Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)
- Clés API pour les services IA (GPT-4, Claude, Gemini)

## 🔧 Configuration

1. **Copier le fichier d'environnement**
   ```bash
   cp env.example .env
   ```

2. **Configurer les variables d'environnement**
   Éditer `.env` et ajouter vos clés API :
   - `OPENAI_API_KEY` : Votre clé OpenAI
   - `ANTHROPIC_API_KEY` : Votre clé Anthropic
   - `GOOGLE_AI_API_KEY` : Votre clé Google AI

## 🐳 Démarrage avec Docker

```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Vérifier que tout fonctionne
docker-compose ps
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

## 🛠️ Développement local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Architecture des ports

| Service    | Port externe | Port interne | Description           |
|------------|--------------|--------------|----------------------|
| Frontend   | 3000         | 80           | Interface React      |
| Backend    | 5000         | 5000         | API Node.js/Express  |
| PostgreSQL | 5432         | 5432         | Base de données      |
| Redis      | 6379         | 6379         | Cache                |

## 🔍 Vérification de santé

```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000/health.txt
```

## 📝 Logs

```bash
# Voir tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛑 Arrêt

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (ATTENTION: supprime les données)
docker-compose down -v
```

## 🆘 Dépannage

### Le frontend affiche une page blanche
1. Vérifier les logs : `docker-compose logs frontend`
2. S'assurer que le build s'est bien passé
3. Vérifier que l'API est accessible

### Erreur de connexion à l'API
1. Vérifier que le backend est démarré : `docker-compose ps backend`
2. Vérifier les logs du backend : `docker-compose logs backend`
3. S'assurer que les ports ne sont pas déjà utilisés

### Problèmes de base de données
1. Vérifier PostgreSQL : `docker-compose logs postgres`
2. S'assurer que les credentials sont corrects dans `.env`

## 🎯 Prochaines étapes

1. Créer un compte utilisateur
2. Explorer le dashboard
3. Tester l'assistant IA multi-modèles
4. Créer votre premier dossier VAE

---

**Besoin d'aide ?** Consultez la documentation complète ou ouvrez une issue sur GitHub. 