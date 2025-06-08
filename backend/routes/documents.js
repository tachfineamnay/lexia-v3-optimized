const express = require('express');
const router = express.Router();
const Document = require('../models/document');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

module.exports = router; 