const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'workshop_oauth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

/**
 * Validate OAuth client credentials against database
 * @param {string} clientId - Client ID to validate
 * @param {string} clientSecret - Client secret to validate
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
async function validateOAuthClient(clientId, clientSecret) {
  try {
    const query = 'SELECT id FROM oauth_clients WHERE client_id = $1 AND client_secret = $2';
    const result = await pool.query(query, [clientId, clientSecret]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error validating OAuth client:', error);
    return false;
  }
}

/**
 * Get all OAuth clients (for debugging/admin purposes)
 * @returns {Promise<Array>} - Array of OAuth clients
 */
async function getAllOAuthClients() {
  try {
    const query = 'SELECT client_id, created_at FROM oauth_clients ORDER BY created_at';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting OAuth clients:', error);
    return [];
  }
}

/**
 * Add a new OAuth client
 * @param {string} clientId - Client ID
 * @param {string} clientSecret - Client secret
 * @returns {Promise<boolean>} - True if added successfully
 */
async function addOAuthClient(clientId, clientSecret) {
  try {
    const query = 'INSERT INTO oauth_clients (client_id, client_secret) VALUES ($1, $2)';
    await pool.query(query, [clientId, clientSecret]);
    return true;
  } catch (error) {
    console.error('Error adding OAuth client:', error);
    return false;
  }
}

/**
 * Initialize database and create tables
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Create oauth_clients table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS oauth_clients (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(255) UNIQUE NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ oauth_clients table created/verified');
    
    // Check if we have any clients, if not, add sample data
    const countQuery = 'SELECT COUNT(*) FROM oauth_clients';
    const countResult = await pool.query(countQuery);
    const clientCount = parseInt(countResult.rows[0].count);
    
    if (clientCount === 0) {
      console.log('🔄 Adding sample OAuth clients...');
      const sampleClients = [
        ['client_id_1', 'client_secret_1'],
        ['client_id_2', 'client_secret_2'],
        ['client_id_3', 'client_secret_3'],
        ['workshop_client', 'workshop_secret_123']
      ];
      
      for (const [clientId, clientSecret] of sampleClients) {
        await addOAuthClient(clientId, clientSecret);
      }
      
      console.log('✅ Sample OAuth clients added');
    }
    
    console.log(`📊 Total OAuth clients in database: ${clientCount > 0 ? clientCount : sampleClients.length}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

module.exports = {
  pool,
  validateOAuthClient,
  getAllOAuthClients,
  addOAuthClient,
  initializeDatabase
};
