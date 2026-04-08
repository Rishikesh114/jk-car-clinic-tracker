const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Share the folder so phones and the PC can see the files
app.use(express.static(__dirname));

// Explicit fallback: If someone goes to the main address, show them the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database Setup
const db = new sqlite3.Database('./carclinic.db', (err) => {
    if (err) console.error("Database error:", err.message);
    else console.log("Connected to the SQLite database.");
});

// Create Table (NOW WITH PAYMENT METHOD)
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT NOT NULL,
    wash_type TEXT NOT NULL,
    payment_method TEXT NOT NULL, 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API ENDPOINT 1: Log a new vehicle
app.post('/api/log', (req, res) => {
    const { license_plate, wash_type, payment_method } = req.body;
    const query = `INSERT INTO logs (license_plate, wash_type, payment_method) VALUES (?, ?, ?)`;
    
    db.run(query, [license_plate, wash_type, payment_method], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Vehicle logged successfully!", id: this.lastID });
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});