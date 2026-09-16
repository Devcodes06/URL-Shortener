const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/user');

describe('User API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  before(async () => {
    // Ensure we are connected to a test database if possible, 
    // but since index.js connects automatically, we just use that.
    // If we wanted to be safer, we could have refactored db connection out of index.js.
  });

  afterEach(async () => {
    await User.deleteMany({ email: testUser.email });
  });

  after(async () => {
    // Optional: Close connection if needed, but index.js doesn't export the connection object easily.
    // However, mocha --exit will handle it.
  });

  describe('POST /user/', () => {
    it('should register a new user and redirect to home', async () => {
      const res = await request(app)
        .post('/user/')
        .send(testUser);

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/');
      expect(res.header['set-cookie']).to.be.an('array');
      
      const user = await User.findOne({ email: testUser.email });
      expect(user).to.not.be.null;
      expect(user.name).to.equal(testUser.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/user/')
        .send({ name: 'Incomplete' });

      expect(res.status).to.equal(400);
      // Since it renders a view, we check if it contains the error message
      expect(res.text).to.contain('All fields are required');
    });
  });

  describe('POST /user/login', () => {
    beforeEach(async () => {
      await request(app).post('/user/').send(testUser);
    });

    it('should login an existing user and redirect to home', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/');
      expect(res.header['set-cookie']).to.be.an('array');
    });

    it('should return 400 for invalid credentials', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).to.equal(400);
      expect(res.text).to.contain('Invalid email or password');
    });
  });

  describe('POST /user/logout', () => {
    it('should clear the uid cookie and redirect to home', async () => {
      const res = await request(app).post('/user/logout');

      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal('/');
      // Check if cookie is cleared (usually by setting it to empty and expiring it)
      const cookieHeader = res.header['set-cookie'][0];
      expect(cookieHeader).to.contain('uid=;');
    });
  });
});
