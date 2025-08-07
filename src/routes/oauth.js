const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { validateOAuthClient } = require('../database/db');

router.post('/token', async (req, res) => {
  const clientId = req.headers['client_id'] || req.headers['client-id'];
  const clientSecret = req.headers['client_secret'] || req.headers['client-secret'];
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing client_id or client_secret in headers' });
  }

  // Phase 2: Use PostgreSQL instead of oauth.txt file
  try {
    const isValid = await validateOAuthClient(clientId, clientSecret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid client_id or client_secret' });
    }
  } catch (error) {
    console.error('Database error during OAuth validation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const payload = { client_id: clientId };
  const secret = process.env.JWT_SECRET || 'default_secret';
  const expiresIn = 60; // 1 minute
  const token = jwt.sign(payload, secret, { expiresIn });
  // Store expiry in milliseconds for compatibility with validation logic
  const expiryTimestampMs = Date.now() + expiresIn * 1000;

  const jwtPath = path.join(__dirname, '../../jwt.txt');
  fs.appendFileSync(jwtPath, `${token}:${expiryTimestampMs}\n`);

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresIn
  });
});

module.exports = router; 