const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Nouvelle conversation'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    model: {
      type: String,
      enum: ['gpt4', 'claude', 'gemini', 'multi'],
      default: 'multi'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    type: String,
    default: 'general'
  },
  metadata: {
    totalTokens: Number,
    lastModel: String,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ 'messages.content': 'text' });

// Méthode pour ajouter un message
conversationSchema.methods.addMessage = function(role, content, model = 'multi') {
  this.messages.push({
    role,
    content,
    model,
    timestamp: new Date()
  });
  return this.save();
};

// Méthode pour obtenir un résumé
conversationSchema.methods.getSummary = function() {
  const messageCount = this.messages.length;
  const lastMessage = this.messages[messageCount - 1];
  
  return {
    id: this._id,
    title: this.title,
    messageCount,
    lastMessage: lastMessage ? {
      content: lastMessage.content.substring(0, 100) + '...',
      timestamp: lastMessage.timestamp
    } : null,
    createdAt: this.createdAt
  };
};

// Méthode statique pour obtenir les conversations d'un utilisateur
conversationSchema.statics.getUserConversations = async function(userId, options = {}) {
  const {
    limit = 10,
    skip = 0,
    includeArchived = false
  } = options;

  const query = { user: userId };
  if (!includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('title messages createdAt updatedAt')
    .lean();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 