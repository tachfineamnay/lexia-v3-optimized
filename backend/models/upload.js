const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Nom du fichier est obligatoire'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  extension: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  dossier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dossier'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
uploadSchema.index({ user: 1, createdAt: -1 });
uploadSchema.index({ filename: 'text', originalName: 'text' });

// Virtual pour l'URL complet du fichier
uploadSchema.virtual('fileUrl').get(function() {
  return `/api/uploads/${this._id}/download`;
});

// Méthode pour vérifier si l'upload est d'un type spécifique
uploadSchema.methods.isType = function(type) {
  const typeMap = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    text: ['text/plain', 'text/csv', 'text/html', 'text/markdown']
  };
  
  return typeMap[type] ? typeMap[type].includes(this.mimetype) : false;
};

// Méthode pour obtenir les informations de base du fichier
uploadSchema.methods.getBasicInfo = function() {
  return {
    id: this._id,
    filename: this.originalName,
    size: this.size,
    type: this.mimetype,
    url: this.fileUrl,
    uploadedAt: this.createdAt
  };
};

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload; 