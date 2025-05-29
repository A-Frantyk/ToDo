import sqlite3 from 'sqlite3';
import path from 'path';

// Enable verbose mode for better debugging
const sqlite = sqlite3.verbose();

// Create a database connection
const dbPath = path.resolve(__dirname, '../../auth.db');
const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ready');
            }
        });

        // Create todos table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            userId INTEGER NOT NULL,
            username TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating todos table:', err.message);
            } else {
                console.log('Todos table ready');
            }
        });

        // Create comments table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            todoId TEXT NOT NULL,
            userId INTEGER NOT NULL,
            username TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (todoId) REFERENCES todos (id),
            FOREIGN KEY (userId) REFERENCES users (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating comments table:', err.message);
            } else {
                console.log('Comments table ready');
            }
        });
    }
});

export default db;
