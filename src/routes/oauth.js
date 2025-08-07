const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { generateToken, storeToken } = require('../utils/jwtUtils');

router.post('/token', async (req, res) => {
  try {
    const clientId = req.headers['client_id'] || req.headers['client-id'];
    const clientSecret = req.headers['client_secret'] || req.headers['client-secret'];
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Missing client_id or client_secret in headers'
      });
    }

    const oauthPath = path.join(__dirname, '../../oauth.txt');
    if (!fs.existsSync(oauthPath)) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OAuth configuration file not found'
      });
    }

    const clients = fs.readFileSync(oauthPath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const valid = clients.some(line => {
      const [id, secret] = line.split(':');
      return id === clientId && secret === clientSecret;
    });

    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid client_id or client_secret'
      });
    }

    const payload = { 
      client_id: clientId,
      type: 'access_token',
      iat: Math.floor(Date.now() / 1000)
    };
    
    const expiresIn = 3600; // 1 hour
    const token = generateToken(payload, expiresIn);
    
    // Store token in Redis
    await storeToken(token, payload, expiresIn);

    res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error generating access token'
    });
  }
});

module.exports = router; 