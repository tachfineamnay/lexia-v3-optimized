// Script d'initialisation MongoDB
db = db.getSiblingDB('LexiaV3');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'lexia_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'changeme',
  roles: [
    {
      role: 'readWrite',
      db: 'LexiaV3'
    }
  ]
});

// Créer l'utilisateur admin si nécessaire
db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    {
      role: 'readWrite',
      db: 'LexiaV3'
    }
  ]
});

// Créer les collections avec validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 60 // bcrypt hash length
        },
        firstName: {
          bsonType: 'string',
          minLength: 1
        },
        lastName: {
          bsonType: 'string',
          minLength: 1
        },
        role: {
          enum: ['user', 'admin', 'super_admin']
        },
        isActive: {
          bsonType: 'bool'
        },
        isEmailVerified: {
          bsonType: 'bool'
        }
      }
    }
  }
});

// Créer les index
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ 'loginHistory.timestamp': -1 });

// Collections pour les documents
db.createCollection('documents');
db.documents.createIndex({ userId: 1, createdAt: -1 });
db.documents.createIndex({ type: 1 });

// Collections pour les dossiers
db.createCollection('dossiers');
db.dossiers.createIndex({ userId: 1, createdAt: -1 });
db.dossiers.createIndex({ status: 1 });

// Collections pour les questions
db.createCollection('questions');
db.questions.createIndex({ category: 1 });
db.questions.createIndex({ isActive: 1 });

print('Database initialization completed'); 