const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Check if user already exists
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Insert the new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                [username, hashedPassword], 
                function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Error registering user' });
                    }
                    
                    // Create and sign a JWT token
                    const token = jwt.sign(
                        { id: this.lastID, username },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    
                    // Return success with token
                    res.status(201).json({
                        message: 'User registered successfully',
                        token,
                        user: { id: this.lastID, username }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login an existing user
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Find the user
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            
            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            
            // Create and sign JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Return success with token
            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user profile
router.get('/profile', (req, res) => {
    try {
        // User data is attached to request object by auth middleware
        const userId = req.user.id;
        
        // Find the user by ID
        db.get('SELECT id, username, created_at FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Return user profile
            res.json({ user });
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
