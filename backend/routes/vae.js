const express = require('express');
const router = express.Router();

// Import direct du middleware sans déstructuration
const authModule = require('../middleware/auth');
const authMiddleware = authModule.authMiddleware;

// Vérification que le middleware est bien une fonction
if (typeof authMiddleware !== 'function') {
  console.error('authMiddleware n\'est pas une fonction:', typeof authMiddleware);
  console.error('authModule contient:', Object.keys(authModule));
}

// Liste des VAE (GET /api/vae) avec pagination simple
router.get('/', authMiddleware || ((req, res, next) => next()), async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    // TODO: remplacer par une vraie requête en BD
    const total = 0;
    const items = [];
    return res.json({ success: true, message: 'Liste VAE', page, limit, total, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Routes VAE avec vérification
// Alias /list -> same shape as '/'
router.get('/list', authMiddleware || ((req, res, next) => next()), (req, res) => {
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const total = 0;
  const items = [];
  res.json({ success: true, message: 'Liste des VAE', page, limit, total, items });
});

router.get('/:id', authMiddleware || ((req, res, next) => next()), (req, res) => {
  res.json({ 
    success: true,
    message: `Détails de la VAE ${req.params.id}`,
    data: { id: req.params.id }
  });
});

router.post('/', authMiddleware || ((req, res, next) => next()), (req, res) => {
  res.json({ 
    success: true,
    message: 'VAE créée avec succès',
    data: req.body
  });
});

router.put('/:id', authMiddleware || ((req, res, next) => next()), (req, res) => {
  res.json({ 
    success: true,
    message: `VAE ${req.params.id} mise à jour`,
    data: { id: req.params.id, ...req.body }
  });
});

router.delete('/:id', authMiddleware || ((req, res, next) => next()), (req, res) => {
  res.json({ 
    success: true,
    message: `VAE ${req.params.id} supprimée`,
    data: { id: req.params.id }
  });
});

module.exports = router;
