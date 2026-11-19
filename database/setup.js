
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create the university database
const dbPath = path.join(__dirname, 'university.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('University database created successfully!');
    }
});

// Create the courses table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courseCode TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            credits INTEGER NOT NULL,
            description TEXT NOT NULL,
            semester TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating courses table:', err.message);
        } else {
            console.log('Courses table created successfully!');
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
