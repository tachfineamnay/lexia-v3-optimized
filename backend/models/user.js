const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma pour les informations professionnelles
const professionalInfoSchema = new mongoose.Schema({
  currentPosition: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    date: Date,
    expiryDate: Date
  }]
}, { _id: false });

// Schéma pour les préférences utilisateur
const userPreferencesSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['fr', 'en'],
    default: 'fr'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  aiAssistance: {
    type: Boolean,
    default: true
  },
  dataSaving: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Schéma principal utilisateur
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est obligatoire'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est obligatoire'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
  },
  firstName: {
    type: String,
    trim: true,
    required: [true, 'Le prénom est obligatoire']
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Le nom est obligatoire']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'France'
    }
  },
  professionalInfo: {
    type: professionalInfoSchema,
    default: () => ({})
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  targetCertification: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'La biographie ne peut pas dépasser 500 caractères']
  },
  profilePicture: {
    type: String  // URL de l'image
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'coach'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  dossiers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dossier'
  }],
  collaborations: [{
    dossier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dossier'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    }
  }],
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  subscriptionExpiry: {
    type: Date
  },
  stripeCustomerId: {
    type: String
  },
  usageStats: {
    aiRequestsCount: {
      type: Number,
      default: 0
    },
    dossiersCreated: {
      type: Number,
      default: 0
    },
    documentsUploaded: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index email supprimé - déjà défini dans init-mongo.js
userSchema.index({ 'professionalInfo.skills': 1 });
userSchema.index({ isActive: 1, role: 1 });

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le profil utilisateur (sans données sensibles)
userSchema.methods.getProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.stripeCustomerId;
  return userObject;
};

// Méthode pour obtenir le profil public (informations limitées)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    profilePicture: this.profilePicture,
    bio: this.bio,
    role: this.role
  };
};

// Méthode pour mettre à jour le statut de connexion
userSchema.methods.updateLoginStatus = async function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    date: new Date(),
    ip: ipAddress,
    userAgent: userAgent
  });
  
  // Limiter l'historique à 10 connexions
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  // Mettre à jour les statistiques d'utilisation
  this.usageStats.lastActive = new Date();
  
  return this.save();
};

// Méthode pour vérifier si l'abonnement est actif
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionStatus !== 'active' && this.subscriptionStatus !== 'trial') {
    return false;
  }
  
  if (this.subscriptionExpiry && this.subscriptionExpiry < new Date()) {
    return false;
  }
  
  return true;
};

// Méthode statique pour trouver un utilisateur par email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 