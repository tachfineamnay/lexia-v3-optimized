const winston = require('winston');
const path = require('path');

// Configuration des formats
const formats = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuration des transports
const transports = [
  // Console pour le développement
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // Fichier pour les erreurs
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Création du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  transports,
  // Gestion des exceptions non capturées
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // Gestion des rejets de promesses non capturés
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Ajout de méthodes utilitaires
logger.startOperation = function(operation, metadata = {}) {
  const operationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  this.info(`Début de l'opération: ${operation}`, {
    operationId,
    operation,
    ...metadata
  });
  return operationId;
};

logger.endOperation = function(operationId, operation, metadata = {}) {
  this.info(`Fin de l'opération: ${operation}`, {
    operationId,
    operation,
    ...metadata
  });
};

logger.logError = function(error, context = {}) {
  this.error('Erreur survenue', {
    error: {
      message: error.message,
      stack: error.stack,
      ...error
    },
    ...context
  });
};

// Middleware Express pour le logging des requêtes
logger.requestLogger = function(req, res, next) {
  const start = Date.now();
  const operationId = this.startOperation('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    this.endOperation(operationId, 'HTTP Request', {
      statusCode: res.statusCode,
      duration
    });
  });

  next();
};

module.exports = logger; 