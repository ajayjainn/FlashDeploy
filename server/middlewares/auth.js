import { verifyToken, getTokenFromRequest } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware to check if user is authenticated via JWT
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from request
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Find user by ID from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Optional JWT authentication - attaches user to request if token is valid,
 * but doesn't reject the request if no token or invalid token
 */
export const optionalJWT = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Just continue without auth
    next();
  }
};

