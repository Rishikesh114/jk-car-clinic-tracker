const request = require('supertest');
const { app, db } = require('../server');

afterAll((done) => {
  db.close(done);
});

describe('JK Car Clinic API Tests', () => {
  it('GET /api/stats should return HTTP 200 and totalToday count', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalToday');
    expect(Array.isArray(res.body.recentLogs)).toBe(true);
  });

  it('POST /api/log should reject missing mandatory fields with 400', async () => {
    const res = await request(app)
      .post('/api/log')
      .send({ license_plate: 'MH12AB1234' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/log should successfully log a vehicle', async () => {
    const res = await request(app)
      .post('/api/log')
      .send({
        license_plate: 'MH12AB1234',
        phone_number: '9876543210',
        wash_type: 'Full Service',
        payment_method: 'UPI'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });
});