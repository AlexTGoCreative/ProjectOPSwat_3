// Redis client setup
const redis = require('redis');
const config = require('./redisConfig');

const client = redis.createClient({
  socket: {
    host: config.host,
    port: config.port
  },
  password: config.password,
  retry_strategy: function(options) {
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after 1 hour
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

let isConnecting = false;

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

client.on('reconnecting', () => {
  console.log('Redis Client Reconnecting');
});

async function connectRedis() {
  if (!client.isOpen && !isConnecting) {
    isConnecting = true;
    try {
      await client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    } finally {
      isConnecting = false;
    }
  }
  return client;
}

module.exports = { client, connectRedis };
