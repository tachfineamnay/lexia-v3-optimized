# Plan de Refonte : ma-vae-facile.fr

## 1. Vision & Objectifs
Transformer LexiaV3 en **ma-vae-facile.fr**, une plateforme ultra-simplifiée dédiée à la VAE (Validation des Acquis de l'Expérience) pour tous les diplômes, avec une offre unique à **49€**.

**Principes Clés :**
*   **Simplicité Radicale :** Un seul tunnel de conversion, pas d'options complexes.
*   **Design "France" :** Bleu (#0055A4), Blanc, Rouge (#EF4135) subtil, typographie propre (Inter/Roboto).
*   **Performance & Robustesse :** Stack technique assainie (Docker, CI/CD, Dépendances).

## 2. Architecture Technique (Conservée & Optimisée)

### Frontend (React + Vite + Tailwind)
*   **Structure :** SPA (Single Page Application).
*   **Pages Clés :**
    1.  **Landing Page (Home) :** Argumentaire, Preuve sociale, CTA "Obtenir ma VAE à 49€".
    2.  **Tunnel de Paiement :** Intégration Stripe simple (Checkout).
    3.  **Onboarding / Register :** Création de compte *après* paiement (ou juste avant).
    4.  **Dashboard Client :**
        *   Upload des documents (CV, preuves).
        *   Chat avec l'IA (Assistant VAE).
        *   Génération du livret.
*   **Design System :** Refonte du `tailwind.config.js` avec la nouvelle palette.

### Backend (Express + MongoDB)
*   **API :** Nettoyage des routes inutiles. Concentration sur :
    *   `/auth` : Login/Register simplifiés.
    *   `/payment` : Webhooks Stripe.
    *   `/vae` : Gestion du dossier client (Uploads, Chat, Génération).
*   **Base de Données :** MongoDB avec Mongoose (Schémas simplifiés si besoin).
*   **IA :** Conservation des services OpenAI/Gemini pour l'aide à la rédaction.

### Infrastructure (Docker + Coolify)
*   **Conteneurs :**
    *   `frontend` : Nginx servant les statiques buildés.
    *   `backend` : Node.js API.
    *   `mongodb` : Base de données.
    *   `redis` : Cache (à conserver si utilisé pour les queues/sessions, sinon supprimer pour simplifier).
*   **CI/CD :** GitHub Actions réparé pour builder et déployer sur Coolify.

## 3. User Flow Cible

1.  **Visiteur** arrive sur `ma-vae-facile.fr`.
2.  **Landing Page :** "Votre VAE en 3 étapes pour 49€".
3.  **CTA :** "Commencer maintenant".
4.  **Paiement :** Redirection Stripe ou Formulaire Stripe Elements.
5.  **Succès Paiement :** Redirection vers création de compte (email/password).
6.  **Dashboard :**
    *   "Bienvenue ! Étape 1 : Déposez votre CV."
    *   "Étape 2 : L'IA analyse votre profil."
    *   "Étape 3 : Générez votre livret 1 & 2."

## 4. Plan de Nettoyage (Cleanup)

### Backend
*   [DELETE] Dépendances : `pg`, `chai` (déplacer en dev), `mongodb-memory-server` (déplacer en dev).
*   [DELETE] Routes/Contrôleurs non utilisés (à identifier précisément, ex: anciennes routes de blog ou admin complexe).
*   [FIX] `server.js` : Gestion robuste de la connexion DB.

### Frontend
*   [DELETE] Pages inutiles : `AdminConfig.jsx`, `AdminUploadQuestions.jsx` (si l'admin n'est plus prioritaire ou peut être simplifié), `QuestionFlow.jsx` (si on remplace par un chat plus simple).
*   [REFACTOR] `Landing.jsx` -> Nouvelle Landing Page.
*   [REFACTOR] `Dashboard.jsx` -> Interface simplifiée.

### Racine
*   [DELETE] Scripts `.sh`, `.bat`, `.ps1` redondants (garder uniquement `deploy.sh` ou `Makefile`).
*   [MOVE] Dockerfiles dans leurs dossiers respectifs (`backend/Dockerfile`, `frontend/Dockerfile`).

## 5. Les 15 Tâches de la Refonte

### Phase 1 : Nettoyage & Infra (Urgent)
1.  **[INFRA] Réparer la structure Docker :** Déplacer `Dockerfile.backend` -> `backend/Dockerfile` et `Dockerfile.frontend` -> `frontend/Dockerfile`. Mettre à jour `docker-compose.yml`.
2.  **[INFRA] Fixer le CI/CD :** Corriger `.github/workflows/deploy.yml` pour utiliser les bons chemins et les secrets GitHub (Coolify Webhook).
3.  **[BACK] Nettoyer package.json :** Supprimer `pg`, déplacer les dépendances de dev, lancer `npm install` propre.
4.  **[BACK] Robustesse DB :** Modifier `server.js` pour gérer proprement l'absence de connexion Mongo (fail fast ou retry).

### Phase 2 : Frontend (Design & Flow)
5.  **[FRONT] Configurer Tailwind :** Mettre à jour `tailwind.config.js` avec les couleurs Bleu (#0055A4) et Rouge (#EF4135). Créer les classes utilitaires de base.
6.  **[FRONT] Créer la Landing Page :** Refaire `Landing.jsx` (Hero section, Arguments, CTA 49€, Footer simple).
7.  **[FRONT] Implémenter le Paiement :** Créer une page/composant de paiement (Stripe integration) et la page `PaymentSuccess`.
8.  **[FRONT] Simplifier l'Auth :** Nettoyer `Login.jsx` et `Register.jsx` pour ne demander que l'essentiel.
9.  **[FRONT] Refondre le Dashboard :** Créer un `DashboardSimple.jsx` avec une vue claire des étapes (Upload -> Chat -> Export).

### Phase 3 : Backend (Logique Métier)
10. **[BACK] API Paiement :** Créer/Vérifier la route `/api/payment/create-checkout-session` et le webhook Stripe.
11. **[BACK] API Documents :** Simplifier l'upload de fichiers (`/api/upload`) et le stockage.
12. **[BACK] API Chat/IA :** Vérifier que l'endpoint de discussion avec l'IA fonctionne avec le nouveau contexte "VAE Générique".

### Phase 4 : Finition & Déploiement
13. **[GLOBAL] Vérification End-to-End :** Tester le flux complet (Visite -> Paiement -> Compte -> Dashboard).
14. **[INFRA] Configurer Coolify :** S'assurer que les variables d'env (STRIPE_KEY, MONGO_URI, etc.) sont bien set sur Coolify.
15. **[DOC] Mise à jour README :** Documenter la nouvelle architecture simplifiée pour maintenance future.
