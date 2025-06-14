const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Routes VAE
router.get('/list', authMiddleware, (req, res) => {
  res.json({ message: 'Liste des VAE' });
});

router.get('/:id', authMiddleware, (req, res) => {
  res.json({ message: `Détails de la VAE ${req.params.id}` });
});

router.post('/', authMiddleware, (req, res) => {
  res.json({ message: 'VAE créée avec succès' });
});

router.put('/:id', authMiddleware, (req, res) => {
  res.json({ message: `VAE ${req.params.id} mise à jour` });
});

router.delete('/:id', authMiddleware, (req, res) => {
  res.json({ message: `VAE ${req.params.id} supprimée` });
});

module.exports = router;
