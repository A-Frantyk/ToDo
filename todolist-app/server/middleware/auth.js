const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'todoapp_jwt_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Add user data to request object
        req.user = decoded;
        
        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { verifyToken, JWT_SECRET };
