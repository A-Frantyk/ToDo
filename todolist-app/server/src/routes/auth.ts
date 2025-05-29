import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { JWT_SECRET } from '../middleware/auth';
import { User, AuthenticatedRequest } from '../types';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password }: { username: string; password: string } = req.body;
        
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        
        // Check if user already exists
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err: Error | null, user: User | undefined) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
                return;
            }
            
            if (user) {
                res.status(400).json({ message: 'User already exists' });
                return;
            }
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Insert the new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                [username, hashedPassword], 
                function(err: Error | null) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: 'Error registering user' });
                        return;
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
router.post('/login', (req: Request, res: Response): void => {
    try {
        const { username, password }: { username: string; password: string } = req.body;
        
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        
        // Find the user
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err: Error | null, user: User | undefined) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
                return;
            }
            
            if (!user) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            
            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password!);
            
            if (!isMatch) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
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
router.get('/profile', (req: AuthenticatedRequest, res: Response): void => {
    try {
        // User data is attached to request object by auth middleware
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        
        // Find the user by ID
        db.get('SELECT id, username, created_at FROM users WHERE id = ?', [userId], (err: Error | null, user: User | undefined) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
                return;
            }
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            // Return user profile
            res.json({ user });
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
