// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (err) {
  console.log('No .env file found, using environment variables');
}

console.log('📦 LexiaV4 Backend Starting...');
console.log('📊 Process Info:');
console.log(`  - Node Version: ${process.version}`);
console.log(`  - Platform: ${process.platform}`);
console.log(`  - Architecture: ${process.arch}`);
console.log(`  - Process ID: ${process.pid}`);

// Handle unhandled errors
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware de sécurité
app.use(helmet());

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['https://app.ialexia.fr'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Écoute les requêtes OPTIONS
app.options('*', (_req, res) => res.sendStatus(204));

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ Auth routes loaded');
} catch (err) {
  console.error('❌ Error loading auth routes:', err.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✓ Users routes loaded');
} catch (err) {
  console.error('❌ Error loading users routes:', err.message);
}

try {
  app.use('/api/vae', require('./routes/vae'));
  console.log('✓ VAE routes loaded');
} catch (err) {
  console.error('❌ Error loading VAE routes:', err.message);
}

try {
  app.use('/api/documents', require('./routes/documents'));
  console.log('✓ Documents routes loaded');
} catch (err) {
  console.error('❌ Error loading documents routes:', err.message);
}

try {
  app.use('/api/questions', require('./routes/questions'));
  console.log('✓ Questions routes loaded');
} catch (err) {
  console.error('❌ Error loading questions routes:', err.message);
}

try {
  app.use('/api/ai', require('./routes/ai'));
  console.log('✓ AI routes loaded');
} catch (err) {
  console.error('❌ Error loading AI routes:', err.message);
}

try {
  app.use('/api/payment', require('./routes/payment'));
  console.log('✓ Payment routes loaded');
} catch (err) {
  console.error('❌ Error loading payment routes:', err.message);
}

// Mount config routes (admin-only)
try {
  app.use('/api/config', require('./routes/config'));
  console.log('✓ Config routes loaded');
} catch (err) {
  console.error('❌ Error loading config routes:', err.message);
}

// Route de santé
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };

  console.log('🔍 Health check requested:', health.status);
  res.json(health);
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Environment variables validation
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.log('Available environment variables:');
  Object.keys(process.env)
    .filter(key => key.startsWith('MONGODB') || key.startsWith('DB_') || key.startsWith('NODE_'))
    .forEach(key => console.log(`  ${key}=${process.env[key]}`));
}

// Connexion à MongoDB et démarrage du serveur seulement si exécuté directement
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/lexiav4';
  console.log('🔗 Attempting MongoDB connection to:', mongoUri.replace(/\/\/.*@/, '//***:***@'));

  mongoose.connect(mongoUri)
    .then(() => {
      console.log('✅ Connecté à MongoDB');
      console.log('🔗 MongoDB connection state:', mongoose.connection.readyState);
    })
    .catch(err => {
      console.error('❌ Erreur connexion MongoDB:', err.message);
      console.error('🚨 Fatal Error: Database connection failed. Exiting...');
      process.exit(1);
    });

  // Démarrage du serveur
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';

  try {
    console.log('🚀 Starting LexiaV4 server...');
    console.log('📊 Server configuration:');
    console.log(`  - Port: ${PORT}`);
    console.log(`  - Host: ${HOST}`);
    console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  - CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log('📞 Attempting to bind to address...');

    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur LexiaV4 démarré sur ${HOST}:${PORT}`);
      console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check available at: http://${HOST}:${PORT}/api/health`);
      console.log(`📋 API info available at: http://${HOST}:${PORT}/api`);
      console.log(`🧪 Test endpoint available at: http://${HOST}:${PORT}/api/test`);
      console.log('✅ Server is ready to accept connections!');
    });

    // Server error handling
    server.on('error', (err) => {
      console.error('🚨 Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else if (err.code === 'EADDRNOTAVAIL') {
        console.error(`❌ Address ${HOST} is not available`);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

// Create necessary directories
const createDirectories = () => {
  const dirs = ['uploads', 'exports', 'logs'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Basic API info route
app.get('/api', (req, res) => {
  res.json({
    name: 'LexiaV3 API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      '/api/health',
      '/api/test',
      '/api/auth',
      '/api/users',
      '/api/config',
      '/api/vae',
      '/api/documents',
      '/api/ai',
      '/api/dashboard'
    ]
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    success: true,
    message: 'LexiaV4 API is working!',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query
  });
});

module.exports = app;