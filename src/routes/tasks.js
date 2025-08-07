const express = require('express');
const router = express.Router();

// TODO: Implement data endpoint with JWT validation
// Requirements:
// 1. Read JWT token from Authorization header
// 2. Validate JWT token and check expiration
// 3. Return mock data if token is valid
router.get('/data', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented - TODO for students',
    hint: 'Implement JWT validation endpoint',
    requirements: [
      'Read JWT token from Authorization header',
      'Validate JWT token and check expiration',
      'Return mock data if token is valid'
    ],
    mockData: [
      { id: 1, title: 'Complete OAuth implementation', status: 'pending' },
      { id: 2, title: 'Implement JWT validation', status: 'in-progress' },
      { id: 3, title: 'Create data endpoint', status: 'completed' }
    ]
  });
});

module.exports = router; 