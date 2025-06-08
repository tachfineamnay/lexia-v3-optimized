const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'txt', 'manual'],
    default: 'manual'
  },
  content: {
    type: String,
    default: ''
  },
  filePath: {
    type: String
  },
  fileName: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  aiAnalysis: {
    summary: String,
    entities: [String],
    sentimentScore: Number,
    keywords: [String],
    recommendations: [String]
  }
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 