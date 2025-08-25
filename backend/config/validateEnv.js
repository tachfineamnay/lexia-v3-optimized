/**
 * Validation des variables d'environnement requises
 */
const requiredEnvVars = [
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET'
];

// En production, MONGODB_URI est requis
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('MONGODB_URI');
}

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGIN',
  'UPLOAD_DIR',
  'MAX_FILE_SIZE',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

// En développement, MONGODB_URI est optionnel
if (process.env.NODE_ENV !== 'production' && !requiredEnvVars.includes('MONGODB_URI')) {
  optionalEnvVars.push('MONGODB_URI');
}

function validateEnv() {
  const missingVars = [];
  
  // Vérifier les variables requises
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ ERREUR : Variables d\'environnement manquantes :');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📋 Veuillez créer un fichier .env avec ces variables.');
    console.error('   Vous pouvez utiliser .env.example comme modèle.\n');
    process.exit(1);
  }
  
  // Afficher les variables optionnelles non définies
  const missingOptional = [];
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingOptional.push(varName);
    }
  });
  
  if (missingOptional.length > 0) {
    console.warn('⚠️  Variables optionnelles non définies :');
    missingOptional.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('');
  }
  
  // Validation spécifique
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET devrait contenir au moins 32 caractères pour une sécurité optimale');
  }
  
  console.log('✅ Variables d\'environnement validées');
}

module.exports = validateEnv; 