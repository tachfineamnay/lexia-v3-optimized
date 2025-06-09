const express = require('express');
const router = express.Router();
const Document = require('../models/document');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Dossier = require('../models/dossier');
const documentGenerator = require('../services/documentGenerator');
const { logger } = require('../utils/logger');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
});

// Create new document
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, type } = req.body;
    
    const newDocument = new Document({
      title,
      description,
      type,
      user: req.user.userId,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
    });
    
    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all documents for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single document
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a document
router.put('/:id', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, type } = req.body;
    
    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (type) updateFields.type = type;
    
    if (req.file) {
      updateFields.filePath = req.file.path;
      updateFields.fileName = req.file.originalname;
    }
    
    // Update document
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: updateFields },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }
    
    // Delete file if it exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Remove document from database
    await document.remove();
    
    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Générer un document VAE
router.post('/generate/:dossierId', isAuthenticated, async (req, res) => {
  const operationId = logger.startOperation('generate_dossier_document');
  
  try {
    const { dossierId } = req.params;
    const { format = 'pdf' } = req.query;

    // Vérifier que le format est valide
    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format de document invalide. Utilisez "pdf" ou "docx".'
      });
    }

    // Récupérer le dossier
    const dossier = await Dossier.findById(dossierId)
      .populate('user', 'firstName lastName')
      .populate('questionSet');

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier que l'utilisateur a le droit d'accéder au dossier
    if (!req.user.isAdmin && dossier.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce dossier'
      });
    }

    // Générer le document
    const document = await documentGenerator.generateDocument(dossier, format);

    logger.endOperation(operationId, {
      dossierId,
      format,
      fileName: document.fileName
    });

    res.json({
      success: true,
      message: 'Document généré avec succès',
      data: {
        fileName: document.fileName,
        downloadUrl: `/api/documents/download/${dossierId}?format=${format}`
      }
    });
  } catch (error) {
    logger.logError('Document generation failed', {
      operationId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du document',
      error: error.message
    });
  }
});

// Télécharger un document VAE
router.get('/download/:dossierId', isAuthenticated, async (req, res) => {
  const operationId = logger.startOperation('download_dossier_document');
  
  try {
    const { dossierId } = req.params;
    const { format = 'pdf' } = req.query;

    // Vérifier que le format est valide
    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format de document invalide. Utilisez "pdf" ou "docx".'
      });
    }

    // Récupérer le dossier
    const dossier = await Dossier.findById(dossierId)
      .populate('user', 'firstName lastName');

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier que l'utilisateur a le droit d'accéder au dossier
    if (!req.user.isAdmin && dossier.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce dossier'
      });
    }

    // Générer le document s'il n'existe pas déjà
    const document = await documentGenerator.generateDocument(dossier, format);

    logger.endOperation(operationId, {
      dossierId,
      format,
      fileName: document.fileName
    });

    // Envoyer le fichier
    res.download(document.filePath, document.fileName, {
      headers: {
        'Content-Type': document.mimeType
      }
    });
  } catch (error) {
    logger.logError('Document download failed', {
      operationId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du document',
      error: error.message
    });
  }
});

module.exports = router; 