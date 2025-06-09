const mongoose = require('mongoose');

// Schéma pour une version du dossier
const versionSchema = new mongoose.Schema({
  versionNumber: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sections: [{
    title: String,
    content: String,
    order: Number
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  _id: true
});

// Schéma pour les commentaires
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  sectionId: {
    type: String
  },
  resolved: {
    type: Boolean,
    default: false
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Schéma pour une section du dossier
const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  lastEditedBy: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user'
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiSuggestions: [{
    suggestion: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    applied: {
      type: Boolean,
      default: false
    }
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

// Schéma principal du dossier
const dossierSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du dossier est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'error'],
    default: 'draft'
  },
  sections: [sectionSchema],
  targetCertification: {
    type: String,
    trim: true
  },
  certificationLevel: {
    type: String,
    trim: true
  },
  specialityOption: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  questionSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSet'
  },
  userResponses: {
    type: Map,
    of: String,
    default: {}
  },
  versions: [versionSchema],
  currentVersion: {
    type: Number,
    default: 1
  },
  lastEdited: {
    type: Date,
    default: Date.now
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  exportHistory: [{
    format: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    versionNumber: Number,
    downloadUrl: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date
  },
  aiMetadata: {
    model: String,
    temperature: Number,
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number
  },
  generationHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    prompt: String,
    response: String,
    section: String,
    modelUsed: String
  }],
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  content: {
    analyse: {
      difficultes: [String],
      points_forts: [String],
      niveau: String
    },
    recommandations: {
      exercices: [String],
      strategies: [String],
      ressources: [String]
    },
    plan_action: {
      objectifs: [String],
      etapes: [String],
      suivi: String
    }
  },
  error: {
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  metadata: {
    generationTime: Number,
    modelVersion: String,
    promptTokens: Number,
    completionTokens: Number
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes pour améliorer les performances
dossierSchema.index({ user: 1, createdAt: -1 });
dossierSchema.index({ title: 'text', description: 'text' });
dossierSchema.index({ 'collaborators.user': 1 });
dossierSchema.index({ status: 1, deadline: 1 });
dossierSchema.index({ 'sections.sectionId': 1 });
dossierSchema.index({ tags: 1 });
dossierSchema.index({ user: 1, status: 1 });
dossierSchema.index({ createdAt: -1 });

// Middleware avant sauvegarde - mise à jour de la date d'édition
dossierSchema.pre('save', function(next) {
  this.lastEdited = new Date();
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

// Méthode pour obtenir une version nettoyée du dossier
dossierSchema.methods.getCleanVersion = function() {
  const dossier = this.toObject();
  
  // Supprimer les métadonnées sensibles
  delete dossier.aiMetadata;
  delete dossier.generationHistory;
  
  // Nettoyer les sections
  dossier.sections = dossier.sections.map(section => {
    delete section.aiSuggestions;
    delete section.metadata;
    return section;
  });
  
  return dossier;
};

// Méthode pour fusionner toutes les sections en un seul document
dossierSchema.methods.generateFullDocument = function() {
  const sortedSections = this.sections
    .sort((a, b) => a.order - b.order);
    
  return {
    title: this.title,
    description: this.description,
    content: sortedSections
      .map(section => `## ${section.title}\n\n${section.content}`)
      .join('\n\n'),
    sections: sortedSections
  };
};

// Méthode pour créer une nouvelle version du dossier
dossierSchema.methods.createVersion = async function(userId, notes = '') {
  const newVersion = {
    versionNumber: this.currentVersion + 1,
    createdBy: userId,
    title: this.title,
    description: this.description,
    sections: this.sections.map(section => ({
      title: section.title,
      content: section.content,
      order: section.order
    })),
    notes: notes
  };
  
  this.versions.push(newVersion);
  this.currentVersion = newVersion.versionNumber;
  
  return this.save();
};

// Méthode pour restaurer une version précédente
dossierSchema.methods.restoreVersion = async function(versionNumber) {
  const version = this.versions.find(v => v.versionNumber === versionNumber);
  
  if (!version) {
    throw new Error(`Version ${versionNumber} introuvable`);
  }
  
  // Créer d'abord une version de sauvegarde de l'état actuel
  await this.createVersion(this.lastEditedBy, 'Sauvegarde automatique avant restauration');
  
  // Restaurer les données de la version demandée
  this.title = version.title;
  this.description = version.description;
  
  // Restaurer les sections
  this.sections = version.sections.map((sectionData, index) => {
    // Conserver les métadonnées des sections existantes si possible
    const existingSection = this.sections.find(s => s.title === sectionData.title);
    
    return {
      sectionId: existingSection?.sectionId || `section-${Date.now()}-${index}`,
      title: sectionData.title,
      content: sectionData.content,
      order: sectionData.order,
      aiGenerated: existingSection?.aiGenerated || false,
      lastEditedBy: 'user',
      lastEditedAt: new Date(),
      metadata: existingSection?.metadata || {},
      aiSuggestions: existingSection?.aiSuggestions || []
    };
  });
  
  return this.save();
};

// Méthode pour ajouter un commentaire à une section
dossierSchema.methods.addComment = function(sectionId, userId, content) {
  const section = this.sections.find(s => s.sectionId === sectionId);
  
  if (!section) {
    throw new Error(`Section ${sectionId} introuvable`);
  }
  
  section.comments.push({
    user: userId,
    content,
    resolved: false
  });
  
  return this.save();
};

// Méthode pour sauvegarder une réponse au questionnaire
dossierSchema.methods.saveResponse = function(questionId, response) {
  if (!this.userResponses) {
    this.userResponses = new Map();
  }
  
  this.userResponses.set(questionId, response);
  return this;
};

// Méthode pour obtenir toutes les réponses du questionnaire
dossierSchema.methods.getAllResponses = function() {
  return this.userResponses ? Object.fromEntries(this.userResponses) : {};
};

// Méthode statique pour trouver les dossiers modifiés récemment d'un utilisateur
dossierSchema.statics.findRecentByUser = function(userId, limit = 5) {
  return this.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email')
    .exec();
};

// Méthode statique pour trouver les dossiers partagés avec un utilisateur
dossierSchema.statics.findSharedWithUser = function(userId, limit = 10) {
  return this.find({
    'collaborators.user': userId,
    user: { $ne: userId } // Exclure les dossiers dont l'utilisateur est propriétaire
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email profilePicture')
    .exec();
};

// Méthode statique pour chercher des dossiers par texte
dossierSchema.statics.searchByText = function(userId, searchText, limit = 20) {
  return this.find({
    $or: [
      { user: userId },
      { 'collaborators.user': userId }
    ],
    $text: { $search: searchText }
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('user', 'firstName lastName email')
    .exec();
};

dossierSchema.statics.findLatestDraft = function(userId) {
  return this.findOne({ 
    user: userId,
    status: 'draft'
  }).sort({ updatedAt: -1 });
};

dossierSchema.statics.findLatestCompleted = function(userId) {
  return this.findOne({ 
    user: userId,
    status: 'completed'
  }).sort({ completedAt: -1 });
};

// Méthodes d'instance
dossierSchema.methods.markAsGenerating = function() {
  this.status = 'generating';
  return this.save();
};

dossierSchema.methods.markAsCompleted = function(content, metadata) {
  this.status = 'completed';
  this.content = content;
  this.metadata = metadata;
  return this.save();
};

dossierSchema.methods.markAsError = function(error) {
  this.status = 'error';
  this.error = {
    message: error.message,
    details: error.stack
  };
  return this.save();
};

// Validation
dossierSchema.pre('validate', function(next) {
  if (this.status === 'completed' && !this.content) {
    this.invalidate('content', 'Le contenu est requis pour un dossier complété');
  }
  next();
});

const Dossier = mongoose.model('Dossier', dossierSchema);

module.exports = Dossier; 