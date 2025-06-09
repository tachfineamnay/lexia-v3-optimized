const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock de nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

describe('Authentication Tests', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and send verification email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Inscription réussie');

      // Vérifier que l'utilisateur est créé dans la base de données
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.isEmailVerified).toBe(false);
      expect(user.emailVerificationToken).toBeTruthy();
    });

    it('should not register a user with existing email', async () => {
      // Créer d'abord un utilisateur
      await User.create(testUser);

      // Tenter de créer un autre utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cet email est déjà utilisé');
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email with valid token', async () => {
      // Créer un utilisateur avec un token de vérification
      const user = await User.create({
        ...testUser,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: Date.now() + 3600000
      });

      const response = await request(app)
        .get(`/api/auth/verify-email/${user.emailVerificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Email vérifié avec succès');

      // Vérifier que l'utilisateur est marqué comme vérifié
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isEmailVerified).toBe(true);
      expect(updatedUser.emailVerificationToken).toBeUndefined();
    });

    it('should not verify email with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Token invalide ou expiré');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur vérifié
      await User.create({
        ...testUser,
        isEmailVerified: true
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not login with unverified email', async () => {
      // Créer un utilisateur non vérifié
      await User.findOneAndUpdate(
        { email: testUser.email },
        { isEmailVerified: false }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Veuillez vérifier votre email');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Email ou mot de passe incorrect');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Créer un utilisateur
      await User.create(testUser);
    });

    it('should send reset password email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Un email de réinitialisation a été envoyé');

      // Vérifier que le token est généré
      const user = await User.findOne({ email: testUser.email });
      expect(user.resetPasswordToken).toBeTruthy();
      expect(user.resetPasswordExpires).toBeTruthy();
    });

    it('should not reveal if email exists', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Un email de réinitialisation a été envoyé');
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      // Créer un utilisateur avec un token de réinitialisation
      const user = await User.create({
        ...testUser,
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: Date.now() + 3600000
      });

      const newPassword = 'newpassword123';
      const response = await request(app)
        .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
        .send({ password: newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Mot de passe réinitialisé avec succès');

      // Vérifier que le token est supprimé
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();

      // Vérifier que le nouveau mot de passe fonctionne
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should not reset password with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password/invalid-token')
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Token invalide ou expiré');
    });
  });
}); 