const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './carclinic.db';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Swagger OpenAPI Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Explicit fallback: Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database Setup
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log(`Connected to SQLite database at ${DB_PATH}`);
});

// Initialize database schema
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT NOT NULL,
    phone_number TEXT, 
    wash_type TEXT NOT NULL,
    payment_method TEXT NOT NULL, 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API ENDPOINT 1: Log a new vehicle
app.post('/api/log', (req, res) => {
    const { license_plate, phone_number, wash_type, payment_method } = req.body;
    
    if (!license_plate || !wash_type || !payment_method) {
        return res.status(400).json({ error: "license_plate, wash_type, and payment_method are required." });
    }

    const query = `INSERT INTO logs (license_plate, phone_number, wash_type, payment_method) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [license_plate, phone_number || '', wash_type, payment_method], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Vehicle logged successfully!", id: this.lastID });
    });
});

// API ENDPOINT 2: Get today's stats
app.get('/api/stats', (req, res) => {
    const query = `SELECT * FROM logs WHERE date(timestamp) = date('now') ORDER BY timestamp DESC`;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ totalToday: rows.length, recentLogs: rows });
    });
});

// API ENDPOINT 3: Export data to CSV
app.get('/api/export', (req, res) => {
    const query = `SELECT * FROM logs ORDER BY timestamp DESC`;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let csv = 'ID,License Plate,Wash Type,Payment Method,Date & Time\n';
        rows.forEach(row => {
            csv += `${row.id},${row.license_plate},${row.wash_type},${row.payment_method},${row.timestamp}\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="jk_car_clinic_history.csv"');
        res.send(csv);
    });
});

// API ENDPOINT 4: Get Frequent Cars (Loyalty Tracking)
app.get('/api/frequent', (req, res) => {
    const query = `
        SELECT license_plate, MAX(phone_number) as phone, COUNT(*) as visit_count 
        FROM logs 
        GROUP BY license_plate 
        ORDER BY visit_count DESC 
        LIMIT 5
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start Server if executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });
}

module.exports = { app, db };