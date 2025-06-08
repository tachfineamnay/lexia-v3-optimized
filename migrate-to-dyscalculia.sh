#!/bin/bash

# Script de migration de VAE vers Dyscalculie pour LexiaV3

echo "🔄 Migration de VAE vers Dyscalculie..."

# Renommer les fichiers VAE
if [ -f "frontend/src/pages/VAECreation.jsx" ]; then
    mv frontend/src/pages/VAECreation.jsx frontend/src/pages/DyscalculiaAssistant.jsx
    echo "✅ Renommé VAECreation.jsx → DyscalculiaAssistant.jsx"
fi

if [ -f "frontend/src/components/VAEWizard.jsx" ]; then
    mv frontend/src/components/VAEWizard.jsx frontend/src/components/DyscalculiaWizard.jsx
    echo "✅ Renommé VAEWizard.jsx → DyscalculiaWizard.jsx"
fi

if [ -f "frontend/src/components/VAEEditor.jsx" ]; then
    mv frontend/src/components/VAEEditor.jsx frontend/src/components/ExerciseEditor.jsx
    echo "✅ Renommé VAEEditor.jsx → ExerciseEditor.jsx"
fi

if [ -f "frontend/src/components/VaeResponseBlock.jsx" ]; then
    mv frontend/src/components/VaeResponseBlock.jsx frontend/src/components/ExerciseBlock.jsx
    echo "✅ Renommé VaeResponseBlock.jsx → ExerciseBlock.jsx"
fi

# Remplacer les références dans tous les fichiers
echo "🔄 Mise à jour des références..."

# Frontend
find frontend/src -type f -name "*.jsx" -o -name "*.js" | while read file; do
    sed -i 's/VAECreation/DyscalculiaAssistant/g' "$file"
    sed -i 's/VAEWizard/DyscalculiaWizard/g' "$file"
    sed -i 's/VAEEditor/ExerciseEditor/g' "$file"
    sed -i 's/VaeResponseBlock/ExerciseBlock/g' "$file"
    sed -i 's/vae-creation/dyscalculia-assistant/g' "$file"
    sed -i 's/dossier VAE/assistant dyscalculie/g' "$file"
    sed -i 's/Dossier VAE/Assistant Dyscalculie/g' "$file"
    sed -i 's/Validation des Acquis/Assistance Dyscalculie/g' "$file"
    sed -i 's/VAE/Dyscalculie/g' "$file"
done

# Backend
find backend -type f -name "*.js" | while read file; do
    sed -i 's/vae/dyscalculia/g' "$file"
    sed -i 's/VAE/Dyscalculia/g' "$file"
done

echo "✅ Migration terminée!" 