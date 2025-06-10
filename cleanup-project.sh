#!/bin/bash
# Script de nettoyage des fichiers obsolètes de LexiaV3

echo "🧹 Nettoyage des fichiers obsolètes..."

# Liste des fichiers à supprimer
FILES_TO_DELETE=(
    "LexiaV3-deploy.sh"
    "LexiaV3-DEPLOYMENT.md"
    "LexiaV3-docker-compose.yml"
    "LexiaV3-GETTING_STARTED.md"
    "LexiaV3-IMPLEMENTATION_SUMMARY.md"
    "LexiaV3-README.md"
    "LexiaV3-UX_DESIGN.md"
    "migrate-to-dyscalculia.sh"
    "diff.txt"
    "diagnose-issues.sh"
    "test-before-deploy.sh"
    "deploy-local.ps1"
    "deploy-local.sh"
    "deployment.config.json"
    "README_DEPLOY.md"
)

# Supprimer les fichiers
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        echo "Suppression de: $file"
        rm -f "$file"
    fi
done

# Nettoyer les fichiers package.json à la racine (non nécessaires)
if [ -f "package.json" ] && [ -d "frontend" ] && [ -d "backend" ]; then
    echo "Suppression des fichiers npm à la racine..."
    rm -f package.json package-lock.json
fi

echo "✅ Nettoyage terminé!"

# Afficher les fichiers restants
echo ""
echo "📁 Fichiers restants à la racine:"
ls -la | grep -v "^d" | grep -v "^total"
