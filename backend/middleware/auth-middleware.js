/**
 * Authentication middleware for PSC Tech School Portal
 */
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify Firebase JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to verify custom JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyJwtToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  verifyJwtToken,
  checkRole
};