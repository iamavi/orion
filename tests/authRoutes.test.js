const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

describe('Auth Routes', () => {
  const testUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'user'
  };

  beforeEach(async () => {
    // Clean up the test database
    await db('employees').truncate();
    await db('employee_auth').truncate();

    // Create a test user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(testUser.password, salt);

    const [employeeId] = await db('employees').insert({
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: testUser.email,
      role: testUser.role
    });

    await db('employee_auth').insert({
      employee_id: employeeId,
      password_hash: hashedPassword,
      salt: salt,
      auth_provider: 'local'
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 400 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should respect rate limiting', async () => {
      // Make 6 login attempts (rate limit is 5)
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });

        if (i < 5) {
          expect(res.statusCode).toBe(400);
        } else {
          expect(res.statusCode).toBe(429);
          expect(res.body.message).toBe('Too many login attempts. Please try again later.');
        }
      }
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset password email for valid user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Password reset instructions sent');
    });

    it('should return same response for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Password reset instructions sent');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let authToken;

    beforeEach(async () => {
      // Login to get auth token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      authToken = loginRes.body.accessToken;
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPass123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Current password is incorrect');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      authToken = loginRes.body.accessToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  afterAll(async () => {
    await db.destroy();
  });
}); 