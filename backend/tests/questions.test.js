const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const QuestionSet = require('../models/questionSet');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

describe('Question Set Administration Tests', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  // Créer les utilisateurs de test
  beforeEach(async () => {
    // Créer un admin
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true
    });

    // Créer un utilisateur normal
    regularUser = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true
    });

    // Générer les tokens
    adminToken = jwt.sign(
      { id: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: regularUser._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // Créer un fichier JSON temporaire pour les tests
  const createTestFile = (content) => {
    const filePath = path.join(__dirname, 'temp-question-set.json');
    fs.writeFileSync(filePath, JSON.stringify(content));
    return filePath;
  };

  // Nettoyer les fichiers temporaires
  afterEach(() => {
    const filePath = path.join(__dirname, 'temp-question-set.json');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  describe('POST /api/questions/upload', () => {
    const validQuestionSet = {
      title: 'Test Questionnaire',
      description: 'A test questionnaire',
      targetCertification: 'DEAES',
      certificationLevel: 'Niveau 3',
      version: '1.0.0',
      isActive: true,
      sections: [
        {
          title: 'Section 1',
          description: 'First section',
          questions: [
            {
              text: 'Test question 1',
              type: 'text',
              required: true
            }
          ]
        }
      ]
    };

    it('should allow admin to upload a valid question set', async () => {
      const filePath = createTestFile(validQuestionSet);

      const response = await request(app)
        .post('/api/questions/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', filePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.questionSet.title).toBe(validQuestionSet.title);

      // Vérifier que le questionnaire est créé en base
      const savedQuestionSet = await QuestionSet.findOne({ title: validQuestionSet.title });
      expect(savedQuestionSet).toBeTruthy();
      expect(savedQuestionSet.isActive).toBe(true);
    });

    it('should reject invalid JSON format', async () => {
      const filePath = createTestFile('invalid json content');

      const response = await request(app)
        .post('/api/questions/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Format JSON invalide');
    });

    it('should reject question set with missing required fields', async () => {
      const invalidQuestionSet = {
        title: 'Invalid Set',
        // Missing required fields
      };
      const filePath = createTestFile(invalidQuestionSet);

      const response = await request(app)
        .post('/api/questions/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeTruthy();
    });

    it('should reject non-admin users', async () => {
      const filePath = createTestFile(validQuestionSet);

      const response = await request(app)
        .post('/api/questions/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', filePath);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Accès non autorisé');
    });

    it('should reject unauthenticated requests', async () => {
      const filePath = createTestFile(validQuestionSet);

      const response = await request(app)
        .post('/api/questions/upload')
        .attach('file', filePath);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Non authentifié');
    });
  });

  describe('GET /api/questions/all', () => {
    beforeEach(async () => {
      // Créer quelques questionnaires de test
      await QuestionSet.create([
        {
          title: 'Active Set 1',
          targetCertification: 'DEAES',
          isActive: true,
          sections: [{ title: 'Section 1', questions: [] }],
          createdBy: adminUser._id
        },
        {
          title: 'Inactive Set 1',
          targetCertification: 'DEAES',
          isActive: false,
          sections: [{ title: 'Section 1', questions: [] }],
          createdBy: adminUser._id
        },
        {
          title: 'Active Set 2',
          targetCertification: 'DEES',
          isActive: true,
          sections: [{ title: 'Section 1', questions: [] }],
          createdBy: adminUser._id
        }
      ]);
    });

    it('should allow admin to list all question sets', async () => {
      const response = await request(app)
        .get('/api/questions/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.questionSets).toHaveLength(3);
    });

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/api/questions/all?active=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.questionSets).toHaveLength(2);
      expect(response.body.questionSets.every(qs => qs.isActive)).toBe(true);
    });

    it('should support filtering by certification', async () => {
      const response = await request(app)
        .get('/api/questions/all?certification=DEAES')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.questionSets).toHaveLength(2);
      expect(response.body.questionSets.every(qs => qs.targetCertification === 'DEAES')).toBe(true);
    });

    it('should support text search', async () => {
      const response = await request(app)
        .get('/api/questions/all?search=Active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.questionSets).toHaveLength(2);
      expect(response.body.questionSets.every(qs => qs.title.includes('Active'))).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/questions/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Accès non autorisé');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/questions/all');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Non authentifié');
    });
  });

  describe('POST /api/questions/:id/activate', () => {
    let questionSet;

    beforeEach(async () => {
      // Créer un questionnaire de test
      questionSet = await QuestionSet.create({
        title: 'Test Set',
        targetCertification: 'DEAES',
        isActive: false,
        sections: [{ title: 'Section 1', questions: [] }],
        createdBy: adminUser._id
      });
    });

    it('should allow admin to activate a question set', async () => {
      const response = await request(app)
        .post(`/api/questions/${questionSet._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.questionSet.isActive).toBe(true);

      // Vérifier en base
      const updatedSet = await QuestionSet.findById(questionSet._id);
      expect(updatedSet.isActive).toBe(true);
    });

    it('should prevent multiple active sets for same certification', async () => {
      // Créer un autre questionnaire actif pour la même certification
      await QuestionSet.create({
        title: 'Active Set',
        targetCertification: 'DEAES',
        isActive: true,
        sections: [{ title: 'Section 1', questions: [] }],
        createdBy: adminUser._id
      });

      const response = await request(app)
        .post(`/api/questions/${questionSet._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: true });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Un questionnaire actif existe déjà');
    });

    it('should allow deactivating a question set', async () => {
      // D'abord activer le questionnaire
      questionSet.isActive = true;
      await questionSet.save();

      const response = await request(app)
        .post(`/api/questions/${questionSet._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.questionSet.isActive).toBe(false);

      // Vérifier en base
      const updatedSet = await QuestionSet.findById(questionSet._id);
      expect(updatedSet.isActive).toBe(false);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post(`/api/questions/${questionSet._id}/activate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ active: true });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Accès non autorisé');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post(`/api/questions/${questionSet._id}/activate`)
        .send({ active: true });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Non authentifié');
    });

    it('should handle non-existent question set', async () => {
      const response = await request(app)
        .post('/api/questions/nonexistentid/activate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: true });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Questionnaire introuvable');
    });
  });
}); 