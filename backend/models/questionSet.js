const mongoose = require('mongoose');

// Schéma pour les options à choix multiples
const optionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
});

// Schéma pour une question individuelle
const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
  required: true,
  default: function() { return new mongoose.Types.ObjectId().toString(); }
  },
  text: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'file', 'date'],
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [optionSchema],
  validation: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiAssist: {
    type: Boolean,
    default: false
  },
  aiPrompt: {
    type: String
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  order: {
    type: Number,
    default: 0
  },
  dependsOn: {
    question: String,
    value: mongoose.Schema.Types.Mixed
  }
});

// Schéma pour une section de questions
const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
  required: true,
  default: function() { return new mongoose.Types.ObjectId().toString(); }
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  questions: [questionSchema]
});

// Schéma principal pour un ensemble de questions
const questionSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetCertification: {
    type: String,
    required: [true, 'La certification cible est obligatoire'],
    trim: true
  },
  certificationLevel: {
    type: String,
    trim: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sections: [sectionSchema],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiPromptTemplate: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes pour améliorer les performances des requêtes
questionSetSchema.index({ targetCertification: 1, version: 1 });
questionSetSchema.index({ title: 'text', description: 'text', targetCertification: 'text' });

// Méthode statique pour trouver les ensembles de questions actifs
questionSetSchema.statics.findActiveSets = function() {
  return this.find({ isActive: true })
    .sort({ targetCertification: 1, version: -1 })
    .exec();
};

// Méthode pour obtenir une version simplifiée de l'ensemble de questions
questionSetSchema.methods.getSimplified = function() {
  const result = {
    id: this._id,
    title: this.title,
  isActive: this.isActive,
    description: this.description,
    targetCertification: this.targetCertification,
    certificationLevel: this.certificationLevel,
    version: this.version,
    sections: this.sections.map(section => ({
  id: section.sectionId,
  title: section.title,
  description: section.description,
  questionCount: Array.isArray(section.questions) ? section.questions.length : 0
    }))
  };
  
  return result;
};

// Méthode pour vérifier si toutes les questions requises sont complètes dans les réponses
questionSetSchema.methods.validateAnswers = function(answers) {
  const missingRequired = [];
  
  this.sections.forEach(section => {
    section.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.questionId];
        if (answer === undefined || answer === null || answer === '') {
          missingRequired.push({
            sectionId: section.sectionId,
            questionId: question.questionId,
            questionText: question.text
          });
        }
      }
    });
  });
  
  return {
    isValid: missingRequired.length === 0,
    missingRequired
  };
};

const QuestionSet = mongoose.model('QuestionSet', questionSetSchema);

module.exports = QuestionSet; 