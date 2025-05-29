import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'todoapp_jwt_secret_key';

// Middleware to verify JWT token
const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        
        // Add user data to request object
        req.user = decoded;
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

export { verifyToken, JWT_SECRET };
