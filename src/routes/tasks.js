const express = require('express');
const router = express.Router();
const { validateToken, revokeToken } = require('../utils/jwtUtils');
const { client: redisClient, connectRedis } = require('../redisClient');

// JWT validation middleware
async function validateJWT(req, res, next) {
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

    const validation = await validateToken(token);
    
    if (!validation.valid) {
      return res.status(401).json({
        error: 'Token validation failed',
        message: validation.error
      });
    }

    req.user = validation.decoded;
    req.tokenMetadata = validation.metadata;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({
      error: 'Token validation error',
      message: 'An error occurred while validating the token'
    });
  }
}

// Mock data endpoint as specified in README
router.get('/data', validateJWT, async (req, res) => {
  try {
    // Return mock data as specified in requirements
    res.json({
      success: true,
      data: {
        message: "Protected data retrieved successfully",
        timestamp: new Date().toISOString(),
        user: req.user.client_id,
        mockData: [
          { id: 1, name: "Sample Item 1" },
          { id: 2, name: "Sample Item 2" },
          { id: 3, name: "Sample Item 3" }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Task routes
router.get('/tasks', validateJWT, async (req, res) => {
  try {
    await connectRedis();
    const tasks = await redisClient.lRange(`tasks:${req.user.client_id}`, 0, -1);
    res.json({ tasks: tasks.map(task => JSON.parse(task)) });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', validateJWT, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = {
      id: Date.now().toString(),
      title,
      description,
      created_at: new Date().toISOString(),
      created_by: req.user.client_id
    };

    await connectRedis();
    await redisClient.lPush(`tasks:${req.user.client_id}`, JSON.stringify(task));
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Token revocation endpoint
router.post('/logout', validateJWT, async (req, res) => {
  try {
    const token = req.headers.authorization.slice(7);
    await revokeToken(token);
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;