const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Routes VAE
router.get('/list', auth.authMiddleware, (req, res) => {
  res.json({ message: 'Liste des VAE' });
});

router.get('/:id', auth.authMiddleware, (req, res) => {
  res.json({ message: `Détails de la VAE ${req.params.id}` });
});

router.post('/', auth.authMiddleware, (req, res) => {
  res.json({ message: 'VAE créée avec succès' });
});

router.put('/:id', auth.authMiddleware, (req, res) => {
  res.json({ message: `VAE ${req.params.id} mise à jour` });
});

router.delete('/:id', auth.authMiddleware, (req, res) => {
  res.json({ message: `VAE ${req.params.id} supprimée` });
});

module.exports = router;
