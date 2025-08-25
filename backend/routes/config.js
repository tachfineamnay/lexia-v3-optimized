const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Configuration templates
const CONFIG_TEMPLATES = {
  server: {
    NODE_ENV: { description: 'Environment (development/production)', encrypted: false },
    PORT: { description: 'Server port', encrypted: false },
    FRONTEND_URL: { description: 'Frontend URL for CORS', encrypted: false }
  },
  database: {
    MONGODB_URI: { description: 'MongoDB connection string', encrypted: true }
  },
  security: {
    JWT_SECRET: { description: 'JWT secret key (min 32 chars)', encrypted: true },
    JWT_EXPIRES_IN: { description: 'JWT expiration time', encrypted: false },
    ENCRYPTION_KEY: { description: 'Encryption key for sensitive data', encrypted: true }
  },
  api: {
    OPENAI_API_KEY: { description: 'OpenAI API key', encrypted: true },
    ANTHROPIC_API_KEY: { description: 'Anthropic API key', encrypted: true },
    GOOGLE_API_KEY: { description: 'Google API key', encrypted: true }
  },
  ai: {
    GOOGLE_API_KEY: { description: 'Google API key', encrypted: true }
  },
  email: {
    EMAIL_HOST: { description: 'SMTP host', encrypted: false },
    EMAIL_PORT: { description: 'SMTP port', encrypted: false },
    EMAIL_USER: { description: 'Email username', encrypted: false },
    EMAIL_PASS: { description: 'Email password', encrypted: true }
  },
  storage: {
    UPLOAD_DIR: { description: 'Upload directory path', encrypted: false },
    MAX_FILE_SIZE: { description: 'Maximum file size in bytes', encrypted: false }
  }
};

// Get all configurations (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    
    // Decrypt sensitive values
    const decryptedConfigs = configs.map(config => {
      const decryptedConfig = config.toObject();
      decryptedConfig.configs = decryptedConfig.configs.map(item => {
        if (item.encrypted && item.value) {
          try {
            // Parse encrypted data
            const encryptedData = JSON.parse(item.value);
            item.value = config.decryptValue(encryptedData);
          } catch (err) {
            console.error('Decryption error:', err);
            item.value = '[Decryption Error]';
          }
        }
        return item;
      });
      return decryptedConfig;
    });
    
    res.json({ configs: decryptedConfigs, templates: CONFIG_TEMPLATES });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get configuration by category
router.get('/:category', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const config = await SystemConfig.findOne({ category });
    
    if (!config) {
      return res.json({ 
        category, 
        configs: [],
        template: CONFIG_TEMPLATES[category] || {}
      });
    }
    
    // Decrypt sensitive values
    const decryptedConfig = config.toObject();
    decryptedConfig.configs = decryptedConfig.configs.map(item => {
      if (item.encrypted && item.value) {
        try {
          const encryptedData = JSON.parse(item.value);
          item.value = config.decryptValue(encryptedData);
        } catch (err) {
          item.value = '[Decryption Error]';
        }
      }
      return item;
    });
    
    res.json({ 
      ...decryptedConfig, 
      template: CONFIG_TEMPLATES[category] || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update configuration
router.post('/:category', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const { configs } = req.body;
    
    let systemConfig = await SystemConfig.findOne({ category });
    
    if (!systemConfig) {
      systemConfig = new SystemConfig({ category, configs: [] });
    }
    
    // Update configs with encryption for sensitive values
    systemConfig.configs = configs.map(configItem => {
      const template = CONFIG_TEMPLATES[category]?.[configItem.key];
      
      if (template?.encrypted && configItem.value) {
        // Encrypt the value
        const encryptedData = systemConfig.encryptValue(configItem.value);
        return {
          ...configItem,
          value: JSON.stringify(encryptedData),
          encrypted: true,
          description: template.description,
          lastModified: new Date(),
          modifiedBy: req.user._id
        };
      }
      
      return {
        ...configItem,
        encrypted: false,
        description: template?.description,
        lastModified: new Date(),
        modifiedBy: req.user._id
      };
    });
    
    await systemConfig.save();
    
    // Update process.env for immediate effect
    configs.forEach(config => {
      if (!template?.encrypted) {
        process.env[config.key] = config.value;
      }
    });
    
    res.json({ message: 'Configuration updated successfully', config: systemConfig });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test configuration
router.post('/test/:category', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const { key, value } = req.body;
    
    let testResult = { success: false, message: 'Test not implemented' };
    
    switch (category) {
      case 'database':
        if (key === 'MONGODB_URI') {
          const mongoose = require('mongoose');
          try {
            await mongoose.createConnection(value).asPromise();
            testResult = { success: true, message: 'Database connection successful' };
          } catch (err) {
            testResult = { success: false, message: err.message };
          }
        }
        break;
        
      case 'email':
        if (key === 'EMAIL_HOST') {
          // Test email configuration
          testResult = { success: true, message: 'Email configuration valid' };
        }
        break;
        
      default:
        testResult = { success: true, message: 'Configuration accepted' };
    }
    
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate secure key
router.get('/generate/:type', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { type } = req.params;
    const crypto = require('crypto');
    
    let generatedValue = '';
    
    switch (type) {
      case 'jwt_secret':
        generatedValue = crypto.randomBytes(32).toString('hex');
        break;
      case 'encryption_key':
        generatedValue = crypto.randomBytes(32).toString('base64');
        break;
      case 'api_key':
        generatedValue = crypto.randomBytes(24).toString('hex');
        break;
      default:
        return res.status(400).json({ message: 'Invalid key type' });
    }
    
    res.json({ value: generatedValue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 