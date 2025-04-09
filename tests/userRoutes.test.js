// Import the required testing libraries and the application
const request = require('supertest');
const app = require('../app'); // Adjust the path if needed
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// Group all tests related to user routes
describe('User Routes', () => {
  let adminToken;

  beforeAll(async () => {
    // Create an admin user and get token for authentication
    const adminUser = {
      email: 'admin@test.com',
      password: 'adminPass123!'
    };
    const response = await request(app)
      .post('/api/auth/login')
      .send(adminUser);
    adminToken = response.body.accessToken;
  });

  beforeEach(async () => {
    // Clean up the test database before each test
    await db('employees').truncate();
    await db('employee_auth').truncate();
  });

  describe('GET /api/users', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
    });

    it('should return array of users if authenticated as admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/users/register', () => {
    const newUser = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      role: 'user',
      phone: '1234567890',
      department: 'IT'
    };

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(newUser);
      expect(res.statusCode).toBe(401);
    });

    it('should create new user if authenticated as admin', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully, and credentials sent via email');
    });

    it('should return 400 if email already exists', async () => {
      // First create a user
      await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      // Try to create another user with same email
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email already in use');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidUser = {
        first_name: 'Test'
        // Missing other required fields
      };

      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('All fields are required');
    });
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.destroy();
  });
}); 