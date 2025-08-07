const express = require('express');
const router = express.Router();

// TODO: Implement OAuth token endpoint
// Requirements:
// 1. Read client_id and client_secret from request headers
// 2. Validate against oauth.txt file (one client per line)
// 3. Generate JWT token with 1-minute expiration
// 4. Store token in jwt.txt file with expiry timestamp
router.post('/token', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented - TODO for students',
    hint: 'Implement OAuth client credentials flow',
    requirements: [
      'Read client_id and client_secret from headers',
      'Validate against oauth.txt file (one client per line)',
      'Generate JWT token (1 minute expiration)',
      'Store token in jwt.txt with expiry timestamp'
    ],
    fileFormats: {
      'oauth.txt': 'client_id:client_secret (one per line)',
      'jwt.txt': 'jwt_token:expiry_timestamp (one per line)'
    }
  });
});

module.exports = router; 