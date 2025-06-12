const express = require('express');
const cors = require('cors');

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Route de santé (obligatoire pour Coolify)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne!' });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    name: 'LexiaV3 Backend',
    status: 'running',
    version: '1.0.0'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 8089;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 