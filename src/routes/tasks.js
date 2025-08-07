const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

function readStoredTokens() {
  try {
    const jwtFilePath = path.join(__dirname, '../../jwt.txt');
    if (!fs.existsSync(jwtFilePath)) {
      return [];
    }
    const content = fs.readFileSync(jwtFilePath, 'utf8');
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [token, expiry] = line.split(':');
        return { token: token.trim(), expiry: parseInt(expiry) };
      });
  } catch (error) {
    console.error('Error reading jwt.txt:', error);
    return [];
  }
}

function isTokenValid(token) {
  const storedTokens = readStoredTokens();
  const now = Date.now();
  
  return storedTokens.some(stored => 
    stored.token === token && stored.expiry > now
  );
}

function validateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header missing',
        message: 'Please provide Authorization header with Bearer token'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Token missing',
        message: 'Please provide a valid JWT token'
      });
    }

    if (!isTokenValid(token)) {
      return res.status(401).json({
        error: 'Token invalid or expired',
        message: 'Token not found in valid tokens or has expired'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'JWT token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'JWT token is invalid'
      });
    } else {
      return res.status(500).json({
        error: 'Token validation error',
        message: error.message
      });
    }
  }
}

router.get('/data', validateJWT, (req, res) => {
  res.json({
    message: 'Successfully authenticated',
    user: req.user,
    data: [
      { id: 1, title: 'Complete OAuth implementation', status: 'pending' },
      { id: 2, title: 'Implement JWT validation', status: 'in-progress' },
      { id: 3, title: 'Create data endpoint', status: 'completed' }
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 