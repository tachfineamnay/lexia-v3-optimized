const mongoose = require('mongoose');
const crypto = require('crypto');

const systemConfigSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['server', 'database', 'security', 'api', 'email', 'storage', 'ai']
  },
  configs: [{
    key: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    encrypted: {
      type: Boolean,
      default: false
    },
    description: String,
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Encrypt sensitive values
systemConfigSchema.methods.encryptValue = function(value) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-encryption-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    authTag: authTag.toString('hex'),
    iv: iv.toString('hex')
  };
};

// Decrypt sensitive values
systemConfigSchema.methods.decryptValue = function(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-encryption-key', 'salt', 32);
  
  const decipher = crypto.createDecipheriv(
    algorithm, 
    key, 
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema); 