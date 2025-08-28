# Correction des Problèmes d'Affichage - LexiaV3 Frontend

## Problèmes identifiés et corrigés

### 1. 🔄 Double Navigation
**Problème**: La page Landing avait sa propre navigation moderne mais l'App.jsx affichait aussi le Navbar classique
**Solution**: Modifié App.jsx pour ne pas afficher le Navbar sur la page Landing (route "/")

### 2. 🎨 Icônes Trop Grandes  
**Problème**: Les Heroicons utilisaient des classes `h-8 w-8`, `h-16 w-16` qui rendaient les icônes énormes
**Solution**: Réduites à `h-6 w-6`, `h-4 w-4`, `h-12 w-12` pour des tailles appropriées

### 3. 🔧 Conflits CSS
**Problème**: Le fichier `lexia-design-system.css` créait des conflits avec TailwindCSS
**Solution**: Temporairement désactivé et optimisé index.css

### 4. 📱 Menu Mobile
**Problème**: Le menu mobile du Navbar classique s'affichait sur la Landing moderne
**Solution**: Le Navbar classique ne s'affiche plus sur la Landing

## Fichiers modifiés

- ✅ `src/App.jsx` - Logique conditionnelle pour le Navbar
- ✅ `src/pages/Landing.jsx` - Tailles d'icônes corrigées  
- ✅ `src/index.css` - Styles optimisés et fix pour SVG
- ✅ `src/styles/lexia-design-system.css` - Temporairement désactivé

## Instructions pour Coolify

### 1. Redéployement automatique
Si vous avez configuré le webhook Git, Coolify redéploiera automatiquement après le push

### 2. Redéployement manuel
1. Aller dans Coolify > Votre projet frontend
2. Cliquer sur "Deploy" 
3. Attendre la fin du build et du déploiement

### 3. Vérification
Après déploiement, vérifiez que :
- ✅ La page d'accueil https://app.ialexia.fr affiche la Landing moderne
- ✅ Les icônes ont une taille normale (pas énormes)
- ✅ Pas de double menu de navigation
- ✅ Le menu mobile fonctionne correctement sur autres pages

## Test en local

```bash
cd frontend
npm run dev
```

Puis ouvrir http://localhost:5173 pour vérifier les corrections

## Notes importantes

- La page Landing (/) utilise maintenant sa propre navigation moderne
- Les autres pages (/dashboard, /login, etc.) utilisent le Navbar classique
- Les icônes ont été redimensionnées pour un affichage optimal
- Le CSS design system peut être réactivé plus tard après optimisation

## Si problèmes persistent

1. Vider le cache du navigateur (Ctrl+F5)
2. Vérifier les DevTools pour les erreurs CSS
3. Redéployer en force sur Coolify
4. Contacter support si nécessaire