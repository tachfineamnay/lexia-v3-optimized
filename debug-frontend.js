#!/usr/bin/env node

console.log('🔍 Diagnostic Frontend LexiaV3');
console.log('================================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement:');
console.log('VITE_API_URL:', process.env.VITE_API_URL || 'NON DÉFINIE');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NON DÉFINIE');

// Vérifier les fichiers de build
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'frontend', 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('\n📁 Vérification des fichiers de build:');
console.log('Dossier dist existe:', fs.existsSync(distPath));

if (fs.existsSync(indexPath)) {
  console.log('index.html existe:', true);
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Extraire les références aux assets
  const scriptMatches = indexContent.match(/src="([^"]+\.js)"/g) || [];
  const cssMatches = indexContent.match(/href="([^"]+\.css)"/g) || [];
  
  console.log('\n🔗 Assets trouvés dans index.html:');
  console.log('Scripts JS:', scriptMatches.length);
  scriptMatches.forEach(match => console.log('  -', match));
  
  console.log('Fichiers CSS:', cssMatches.length);
  cssMatches.forEach(match => console.log('  -', match));
  
  // Vérifier si les fichiers assets existent
  console.log('\n✅ Vérification de l\'existence des assets:');
  
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath, { recursive: true });
    console.log('Nombre total d\'assets:', assets.length);
    
    const jsFiles = assets.filter(file => file.endsWith('.js'));
    const cssFiles = assets.filter(file => file.endsWith('.css'));
    
    console.log('Fichiers JS:', jsFiles.length);
    console.log('Fichiers CSS:', cssFiles.length);
    
    if (jsFiles.length === 0) {
      console.log('❌ PROBLÈME: Aucun fichier JS trouvé dans assets/');
    }
    
    if (cssFiles.length === 0) {
      console.log('❌ PROBLÈME: Aucun fichier CSS trouvé dans assets/');
    }
  } else {
    console.log('❌ PROBLÈME: Dossier assets/ n\'existe pas');
  }
} else {
  console.log('❌ PROBLÈME: index.html n\'existe pas');
}

// Recommandations
console.log('\n💡 Recommandations:');
console.log('1. Vérifiez que la build a été exécutée avec succès');
console.log('2. Vérifiez les variables d\'environnement VITE_API_URL');
console.log('3. Vérifiez que nginx sert correctement les assets statiques');
console.log('4. Consultez les logs du navigateur pour les erreurs JavaScript');

console.log('\n🔧 Commandes de dépannage:');
console.log('# Rebuild l\'application:');
console.log('cd frontend && npm run build');
console.log('');
console.log('# Vérifier les logs nginx:');
console.log('docker logs [nom_container_frontend]');
console.log('');
console.log('# Tester localement:');
console.log('cd frontend/dist && npx serve -s .');