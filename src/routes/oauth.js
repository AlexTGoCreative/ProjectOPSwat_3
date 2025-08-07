const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

router.post('/token', (req, res) => {
  const clientId = req.headers['client_id'] || req.headers['client-id'];
  const clientSecret = req.headers['client_secret'] || req.headers['client-secret'];
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing client_id or client_secret in headers' });
  }

  const oauthPath = path.join(__dirname, '../../oauth.txt');
  if (!fs.existsSync(oauthPath)) {
    return res.status(500).json({ error: 'oauth.txt file not found' });
  }
  const clients = fs.readFileSync(oauthPath, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
  const valid = clients.some(line => {
    const [id, secret] = line.split(':');
    return id === clientId && secret === clientSecret;
  });
  if (!valid) {
    return res.status(401).json({ error: 'Invalid client_id or client_secret' });
  }

  const payload = { client_id: clientId };
  const secret = process.env.JWT_SECRET || 'default_secret';
  const expiresIn = 60; // 1 minute
  const token = jwt.sign(payload, secret, { expiresIn });
  const expiryTimestamp = Math.floor(Date.now() / 1000) + expiresIn;

  const jwtPath = path.join(__dirname, '../../jwt.txt');
  fs.appendFileSync(jwtPath, `${token}:${expiryTimestamp}\n`);

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresIn
  });
});

module.exports = router; 