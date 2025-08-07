const jwt = require('jsonwebtoken');
const { client: redisClient, connectRedis } = require('../redisClient');

if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET environment variable is not set. This is a security risk!');
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

// Store token with metadata in Redis
async function storeToken(token, payload, expiresIn) {
  await connectRedis();
  const tokenData = {
    clientId: payload.client_id,
    issuedAt: Date.now(),
    expiresAt: Date.now() + (expiresIn * 1000)
  };
  
  await redisClient.set(
    `jwt:${token}`,
    JSON.stringify(tokenData),
    { EX: expiresIn }
  );
}

// Validate and get token data from Redis
async function validateToken(token) {
  try {
    await connectRedis();
    const tokenData = await redisClient.get(`jwt:${token}`);
    
    if (!tokenData) {
      return { valid: false, error: 'Token not found or expired' };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded, metadata: JSON.parse(tokenData) };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      await redisClient.del(`jwt:${token}`);
      return { valid: false, error: 'Token expired' };
    }
    return { valid: false, error: error.message };
  }
}

// Revoke a token
async function revokeToken(token) {
  await connectRedis();
  await redisClient.del(`jwt:${token}`);
}

// Generate a new token
function generateToken(payload, expiresIn = 3600) { // Default 1 hour
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  storeToken,
  validateToken,
  revokeToken,
  generateToken
};
