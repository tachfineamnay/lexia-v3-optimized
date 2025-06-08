const mongoose = require('mongoose');

const vertexConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la configuration est obligatoire'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // Configuration de l'API Google Cloud
  googleCloudConfig: {
    projectId: {
      type: String,
      required: [true, 'L\'ID du projet Google Cloud est obligatoire']
    },
    location: {
      type: String,
      required: [true, 'La région Google Cloud est obligatoire'],
      default: 'us-central1'
    },
    apiKey: {
      type: String,
      required: [true, 'La clé API est obligatoire']
    },
    serviceAccountKeyPath: {
      type: String
    }
  },
  // Configuration du modèle
  modelConfig: {
    modelName: {
      type: String,
      required: [true, 'Le nom du modèle est obligatoire'],
      default: 'gemini-1.5-pro'
    },
    temperature: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.4
    },
    maxOutputTokens: {
      type: Number,
      min: 1,
      default: 2048
    },
    topP: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.95
    },
    topK: {
      type: Number,
      min: 1,
      default: 40
    }
  },
  // Limites d'utilisation
  usageLimits: {
    maxTokensPerRequest: {
      type: Number,
      default: 8192
    },
    maxRequestsPerDay: {
      type: Number,
      default: 1000
    },
    maxTokensPerDay: {
      type: Number,
      default: 1000000
    }
  },
  // Paramètres de prompts par défaut
  promptTemplates: {
    type: Map,
    of: String,
    default: {
      summary: "Faites un résumé concis et factuel du texte suivant : {{text}}",
      analysis: "Analysez le texte suivant et identifiez les éléments clés pertinents pour un dossier VAE : {{text}}",
      suggestions: "Sur la base de ce contenu, suggérez des améliorations pour renforcer le dossier VAE : {{text}}",
      questions: "Proposez 5 questions détaillées pour aider l'utilisateur à approfondir cette section de son dossier VAE : {{text}}"
    }
  },
  // Statistiques d'utilisation
  usageStats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    totalTokensUsed: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    requestsToday: {
      type: Number,
      default: 0
    },
    tokensToday: {
      type: Number,
      default: 0
    },
    dailyStatsResetAt: {
      type: Date,
      default: Date.now
    }
  },
  // Options avancées
  advancedOptions: {
    safetySettings: [{
      category: String,
      threshold: String
    }],
    streamingEnabled: {
      type: Boolean,
      default: true
    },
    contextWindow: {
      type: Number,
      default: 32768
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Marquer une configuration comme par défaut
vertexConfigSchema.methods.setAsDefault = async function() {
  // D'abord, réinitialiser tous les autres à false
  await this.constructor.updateMany(
    { _id: { $ne: this._id } },
    { $set: { isDefault: false } }
  );
  
  // Ensuite, définir celui-ci comme par défaut
  this.isDefault = true;
  return this.save();
};

// Incrémenter les statistiques d'utilisation
vertexConfigSchema.methods.recordUsage = async function(tokensUsed) {
  // Vérifier si la date de réinitialisation quotidienne est passée
  const now = new Date();
  if (this.usageStats.dailyStatsResetAt < now.setHours(0, 0, 0, 0)) {
    this.usageStats.requestsToday = 0;
    this.usageStats.tokensToday = 0;
    this.usageStats.dailyStatsResetAt = now;
  }
  
  // Incrémenter les compteurs
  this.usageStats.totalRequests += 1;
  this.usageStats.totalTokensUsed += tokensUsed;
  this.usageStats.requestsToday += 1;
  this.usageStats.tokensToday += tokensUsed;
  this.usageStats.lastUsed = new Date();
  
  return this.save();
};

// Vérifier si la limite quotidienne a été atteinte
vertexConfigSchema.methods.hasReachedDailyLimit = function() {
  // Vérifier si la date de réinitialisation quotidienne est passée
  const now = new Date();
  if (this.usageStats.dailyStatsResetAt < now.setHours(0, 0, 0, 0)) {
    return false; // Nouvelle journée, donc pas de limite atteinte
  }
  
  return (
    this.usageStats.requestsToday >= this.usageLimits.maxRequestsPerDay ||
    this.usageStats.tokensToday >= this.usageLimits.maxTokensPerDay
  );
};

// Méthode statique pour trouver la configuration active par défaut
vertexConfigSchema.statics.findDefault = async function() {
  const defaultConfig = await this.findOne({ isDefault: true, isActive: true });
  if (defaultConfig) return defaultConfig;
  
  // Si aucune configuration par défaut n'est trouvée, essayer d'en trouver une active
  const anyActiveConfig = await this.findOne({ isActive: true });
  return anyActiveConfig;
};

// Nettoyer les informations sensibles pour la réponse API
vertexConfigSchema.methods.getSafeConfig = function() {
  const config = this.toObject();
  
  // Masquer les clés sensibles
  if (config.googleCloudConfig.apiKey) {
    config.googleCloudConfig.apiKey = '••••••••' + config.googleCloudConfig.apiKey.slice(-4);
  }
  
  if (config.googleCloudConfig.serviceAccountKeyPath) {
    config.googleCloudConfig.serviceAccountKeyPath = '••••••••';
  }
  
  return config;
};

const VertexConfig = mongoose.model('VertexConfig', vertexConfigSchema);

module.exports = VertexConfig; 