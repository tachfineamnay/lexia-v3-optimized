const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        database: 'checking...'
      }
    };

    // Check MongoDB connection
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        healthcheck.services.database = 'healthy';
      } else {
        healthcheck.services.database = 'disconnected';
        healthcheck.message = 'Database disconnected';
      }
    } catch (dbError) {
      healthcheck.services.database = 'error';
      healthcheck.message = 'Database error';
      console.error('Database health check failed:', dbError);
    }

    // Return appropriate status code
    const statusCode = healthcheck.services.database === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthcheck);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      uptime: process.uptime(),
      message: 'Error',
      timestamp: Date.now(),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check (for monitoring)
 * @access  Public (consider adding auth in production)
 */
router.get('/detailed', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const detailed = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      node: {
        version: process.version,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        },
        cpu: cpuUsage
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    };

    // Get database stats if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const dbStats = await mongoose.connection.db.stats();
        detailed.database.stats = {
          collections: dbStats.collections,
          documents: dbStats.objects,
          dataSize: `${Math.round(dbStats.dataSize / 1024 / 1024)} MB`,
          indexSize: `${Math.round(dbStats.indexSize / 1024 / 1024)} MB`
        };
      } catch (error) {
        detailed.database.error = error.message;
      }
    }

    res.json(detailed);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      message: 'Error getting detailed health',
      error: error.message
    });
  }
});

module.exports = router; 