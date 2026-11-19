
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// Connect to the university database
const dbPath = path.join(__dirname, 'database', 'university.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to university database.');
    }
});

// GET all courses
app.get('/api/courses', (req, res) => {
    const sql = 'SELECT * FROM courses';

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

// GET one course by ID
app.get('/api/courses/:id', (req, res) => {
    const sql = 'SELECT * FROM courses WHERE id = ?';

    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json(row);
    });
});

// POST a new course
app.post('/api/courses', (req, res) => {
    const { courseCode, title, credits, description, semester } = req.body;

    if (!courseCode || !title || !Number.isInteger(credits) ||
        credits <= 0 || !description || !semester) {
        return res.status(400).json({
            error: 'Please provide a courseCode, title, positive integer credits, description, and semester.'
        });
    }

    const sql = `
        INSERT INTO courses (courseCode, title, credits, description, semester)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [courseCode, title, credits, description, semester], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Course created successfully',
            id: this.lastID,
            courseCode,
            title,
            credits,
            description,
            semester
        });
    });
});

// PUT update an existing course
app.put('/api/courses/:id', (req, res) => {
    const { courseCode, title, credits, description, semester } = req.body;

    if (!courseCode || !title || !Number.isInteger(credits) ||
        credits <= 0 || !description || !semester) {
        return res.status(400).json({
            error: 'Please provide a courseCode, title, positive integer credits, description, and semester.'
        });
    }

    const sql = `
        UPDATE courses
        SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ?
        WHERE id = ?
    `;

    db.run(sql, [courseCode, title, credits, description, semester, req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({
            message: 'Course updated successfully',
            id: Number(req.params.id),
            courseCode,
            title,
            credits,
            description,
            semester
        });
    });
});

// DELETE a course
app.delete('/api/courses/:id', (req, res) => {
    const sql = 'DELETE FROM courses WHERE id = ?';

    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({
            message: 'Course deleted successfully'
        });
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`University Course API running at http://localhost:${PORT}`);
    });
}

module.exports = { app, db };
