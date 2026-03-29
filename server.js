const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Setup SQLite database
const dbFile = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create orders table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            customer_phone TEXT,
            items TEXT,
            total_amount REAL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

app.post('/api/orders', (req, res) => {
    const { name, phone, items, total } = req.body;
    
    // Ensure data is present
    if (!name || !items || total === undefined) {
        return res.status(400).json({ error: 'Missing required order fields.' });
    }

    const insertQuery = `INSERT INTO orders (customer_name, customer_phone, items, total_amount) VALUES (?, ?, ?, ?)`;
    db.run(insertQuery, [name, phone, JSON.stringify(items), total], function(err) {
        if (err) {
            console.error('Error saving order', err);
            return res.status(500).json({ error: 'Failed to save order' });
        }
        res.status(201).json({ message: 'Order created successfully', orderId: this.lastID });
    });
});

app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY order_date DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
