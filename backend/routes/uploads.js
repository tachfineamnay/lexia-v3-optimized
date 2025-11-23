const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, requirePayment } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Upload = require('../models/upload');
const Dossier = require('../models/dossier');

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Créer un sous-dossier pour chaque utilisateur
    const userDir = path.join(uploadDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Accepter uniquement les fichiers PDF, JPG et PNG
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png'];

  const mimetype = allowedTypes.includes(file.mimetype);
  const extname = allowedExt.includes(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error('Format de fichier non supporté. Seuls les PDF, JPG et PNG sont acceptés.'), false);
  }
};

// Configurer l'upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  },
  fileFilter: fileFilter
});

/**
 * @route   POST /api/uploads
 * @desc    Téléverser un fichier
 * @access  Private
 */
router.post('/', authMiddleware, requirePayment, upload.single('file'), async (req, res) => {
  try {
    // Vérifier si le fichier existe
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier n\'a été téléversé'
      });
    }

    // Récupérer les métadonnées depuis le formulaire
    const { type, description, dossier, tags } = req.body;

    // Extraire l'extension
    const extension = path.extname(req.file.originalname).substring(1);

    // Créer un nouvel enregistrement Upload
    const newUpload = new Upload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extension,
      user: req.user.id,
      metadata: {
        type: type || 'document',
        description: description || ''
      },
      dossier: dossier || null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    // Sauvegarder l'enregistrement
    await newUpload.save();

    // Si un dossier est spécifié, ajouter la référence au dossier
    if (dossier) {
      await Dossier.findByIdAndUpdate(
        dossier,
        { $push: { uploads: newUpload._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Fichier téléversé avec succès',
      upload: newUpload.getBasicInfo()
    });
  } catch (error) {
    console.error('Erreur de téléversement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléversement du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/uploads
 * @desc    Obtenir la liste des fichiers de l'utilisateur
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 items
    const skip = (page - 1) * limit;

    // Filtre optionnel par type
    const filter = { user: req.user.id };
    if (req.query.type) {
      filter['metadata.type'] = req.query.type;
    }

    // Filtre optionnel par dossier
    if (req.query.dossier) {
      filter.dossier = req.query.dossier;
    }

    // Filtre de recherche dans le nom du fichier
    if (req.query.search) {
      filter.$or = [
        { originalName: { $regex: req.query.search, $options: 'i' } },
        { 'metadata.description': { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Compter le nombre total pour la pagination
    const total = await Upload.countDocuments(filter);

    // Récupérer les uploads
    const uploads = await Upload.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      uploads: uploads.map(upload => upload.getBasicInfo())
    });
  } catch (error) {
    console.error('Erreur de récupération des uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/uploads/:id
 * @desc    Obtenir les détails d'un fichier
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérifier les droits d'accès (propriétaire ou admin)
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce fichier'
      });
    }

    res.json({
      success: true,
      upload
    });
  } catch (error) {
    console.error('Erreur de récupération du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/uploads/:id/download
 * @desc    Télécharger un fichier
 * @access  Private
 */
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérifier les droits d'accès
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin' && !upload.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce fichier'
      });
    }

    // Vérifier si le fichier existe sur le disque
    if (!fs.existsSync(upload.path)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier physique introuvable'
      });
    }

    // Servir le fichier
    res.download(upload.path, upload.originalName);
  } catch (error) {
    console.error('Erreur de téléchargement du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/uploads/:id
 * @desc    Supprimer un fichier
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérifier les droits d'accès
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce fichier'
      });
    }

    // Si le fichier est attaché à un dossier, le retirer de la liste des uploads du dossier
    if (upload.dossier) {
      await Dossier.findByIdAndUpdate(
        upload.dossier,
        { $pull: { uploads: upload._id } }
      );
    }

    // Supprimer le fichier physique si présent
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }

    // Supprimer l'enregistrement
    await upload.remove();

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/uploads/:id
 * @desc    Mettre à jour les métadonnées d'un fichier
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérifier les droits d'accès
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce fichier'
      });
    }

    // Champs modifiables
    const { dossier, description, isPublic, tags } = req.body;

    // Mettre à jour les champs
    if (description !== undefined) {
      upload.metadata.set('description', description);
    }

    if (isPublic !== undefined) {
      upload.isPublic = isPublic;
    }

    if (tags !== undefined) {
      upload.tags = tags.split(',').map(tag => tag.trim());
    }

    // Gérer l'association avec un dossier
    if (dossier !== undefined && dossier !== upload.dossier?.toString()) {
      // Si était attaché à un dossier précédent, le retirer
      if (upload.dossier) {
        await Dossier.findByIdAndUpdate(
          upload.dossier,
          { $pull: { uploads: upload._id } }
        );
      }

      // Attacher au nouveau dossier
      if (dossier) {
        await Dossier.findByIdAndUpdate(
          dossier,
          { $push: { uploads: upload._id } }
        );
        upload.dossier = dossier;
      } else {
        upload.dossier = null;
      }
    }

    // Sauvegarder les modifications
    await upload.save();

    res.json({
      success: true,
      message: 'Fichier mis à jour avec succès',
      upload: upload.getBasicInfo()
    });
  } catch (error) {
    console.error('Erreur de mise à jour du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;