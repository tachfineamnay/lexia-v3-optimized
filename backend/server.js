const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/uploads');
const questionRoutes = require('./routes/questions');
const vertexRoutes = require('./routes/vertex');
const configRoutes = require('./routes/config');
const dossierRoutes = require('./routes/dossiers');
const healthRoutes = require('./routes/health');

// Load environment variables
dotenv.config();

// Validate environment variables
const validateEnv = require('./config/validateEnv');
validateEnv();

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || false 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8083'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${req.ip}`);
  next();
});

// MongoDB Connection with improved error handling and logging
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Try to connect to MongoDB but don't exit if it fails
if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/LexiaV3', {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    auth: {
      username: process.env.MONGO_ROOT_USERNAME,
      password: process.env.MONGO_ROOT_PASSWORD
    }
  })
    .then(() => {
      console.log('=================================');
      console.log('✓ Connected to MongoDB database');
      console.log(`✓ Database: ${mongoose.connection.name}`);
      console.log(`✓ Host: ${mongoose.connection.host}`);
      console.log(`✓ Port: ${mongoose.connection.port}`);
      console.log('=================================');
    })
    .catch(err => {
      console.error('=================================');
      console.error('⚠️  MongoDB connection error:', err.message);
      console.error('⚠️  The server will continue running without database support');
      console.error('⚠️  Some features may not work properly');
      console.error('=================================');
    });
} else {
  console.warn('=================================');
  console.warn('⚠️  Running without MongoDB connection');
  console.warn('⚠️  Set MONGODB_URI environment variable to enable database');
  console.warn('=================================');
}

// Monitor MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected');
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/vertex', vertexRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dossiers', dossierRoutes);

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Serve static files for exports
app.use('/api/dossiers/download', express.static(exportsDir));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Global error handling middleware (four parameters)
app.use((err, req, res, next) => {
  // Log the error details
  console.error('=================================');
  console.error(`❌ ERROR ${err.name || 'UnknownError'}: ${err.message}`);
  console.error(`❌ Stack: ${err.stack}`);
  console.error(`❌ Route: ${req.method} ${req.originalUrl}`);
  console.error('=================================');

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Send response to client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      name: err.name
    } : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API URL: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // For debugging in development, consider crashing the process
  if (process.env.NODE_ENV === 'development') {
    throw reason;
  }
});

module.exports = app; 