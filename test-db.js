const { Pool } = require('pg');
require('dotenv').config();

// Configurația bazei de date
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'workshop_oauth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('🔄 Testing PostgreSQL connection...');
    
    // Test conexiunea
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test o query simplă
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Current database time:', result.rows[0].current_time);
    
    client.release();
    console.log('✅ Connection test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error('Error:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file configuration');
    console.error('3. Verify database name, user, and password');
    console.error('4. Ensure the database "workshop_oauth" exists');
    
    return false;
  } finally {
    await pool.end();
  }
}

// Rulează testul
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
