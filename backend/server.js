const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route (MUST be first)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB Connection (non-blocking)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✓ Connected to MongoDB');
    } else {
      console.warn('⚠️ No MONGODB_URI provided, running without database');
    }
  } catch (error) {
    console.error('⚠️ MongoDB connection failed:', error.message);
    console.log('⚠️ Server will continue without database');
  }
};

// Connect to database (don't wait for it)
connectDB();

// Import and use routes (with error handling)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.warn('⚠️ Auth routes not available:', error.message);
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
} catch (error) {
  console.warn('⚠️ User routes not available:', error.message);
}

try {
  const dossierRoutes = require('./routes/dossiers');
  app.use('/api/dossiers', dossierRoutes);
} catch (error) {
  console.warn('⚠️ Dossier routes not available:', error.message);
}

try {
  const uploadRoutes = require('./routes/uploads');
  app.use('/api/uploads', uploadRoutes);
} catch (error) {
  console.warn('⚠️ Upload routes not available:', error.message);
}

// Create necessary directories
const createDirectories = () => {
  const dirs = ['uploads', 'exports', 'logs'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Basic API info route
app.get('/api', (req, res) => {
  res.json({
    name: 'LexiaV3 API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/users',
      '/api/dossiers',
      '/api/uploads'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8089;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app; 