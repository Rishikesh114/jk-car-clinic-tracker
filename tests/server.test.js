const request = require('supertest');
const { app, db } = require('../server');

describe('JK Car Clinic Tracker API & Server Tests', () => {

    afterAll((done) => {
        db.close(done);
    });

    test('GET / - Should serve main dashboard HTML', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('text/html');
        expect(response.text).toContain('JK Car Clinic');
    });

    test('GET /api-docs/ - Should serve Swagger OpenAPI UI', async () => {
        const response = await request(app).get('/api-docs/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('swagger');
    });

    test('POST /api/log - Should log a new vehicle successfully', async () => {
        const newLog = {
            license_plate: 'MH 12 AB 9999',
            phone_number: '9876543210',
            wash_type: 'Full Service',
            payment_method: 'UPI'
        };

        const response = await request(app)
            .post('/api/log')
            .send(newLog);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Vehicle logged successfully!');
        expect(response.body).toHaveProperty('id');
    });

    test('POST /api/log - Should fail validation when required fields are missing', async () => {
        const invalidLog = {
            license_plate: 'MH 12 AB 9999'
            // Missing wash_type and payment_method
        };

        const response = await request(app)
            .post('/api/log')
            .send(invalidLog);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('GET /api/stats - Should fetch today\'s stats', async () => {
        const response = await request(app).get('/api/stats');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('totalToday');
        expect(response.body).toHaveProperty('recentLogs');
        expect(Array.isArray(response.body.recentLogs)).toBe(true);
    });

    test('GET /api/frequent - Should fetch top frequent cars', async () => {
        const response = await request(app).get('/api/frequent');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/export - Should return CSV history export', async () => {
        const response = await request(app).get('/api/export');
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.text).toContain('ID,License Plate,Wash Type,Payment Method,Date & Time');
    });

});
