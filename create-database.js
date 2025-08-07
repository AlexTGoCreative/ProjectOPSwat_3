const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createDatabase() {
  // Connect to default postgres database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    
    // Create the workshop_oauth database
    await pool.query('CREATE DATABASE workshop_oauth');
    console.log('✅ Database "workshop_oauth" created successfully!');
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log('✅ Database "workshop_oauth" already exists!');
    } else {
      console.error('❌ Error creating database:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

async function runSetupScript() {
  // Connect to the workshop_oauth database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'workshop_oauth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔄 Reading and executing setup.sql...');
    
    // Read the setup.sql file
    const setupSqlPath = path.join(__dirname, 'database', 'setup.sql');
    const setupSql = fs.readFileSync(setupSqlPath, 'utf-8');
    
    // Remove comments and split by semicolon
    const statements = setupSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0) // Remove comments and empty lines
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`� Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   ${i + 1}. Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      }
    }
    
    console.log('✅ All SQL statements executed successfully!');
    
    // Verify the data
    const result = await pool.query('SELECT * FROM oauth_clients');
    console.log(`📊 OAuth clients in database: ${result.rows.length}`);
    result.rows.forEach(row => {
      console.log(`   - ${row.client_id} (created: ${row.created_at.toISOString().split('T')[0]})`);
    });
    
  } catch (error) {
    console.error('❌ Error executing setup.sql:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function fullSetup() {
  try {
    await createDatabase();
    await runSetupScript();
    console.log('🎉 Database and tables setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

fullSetup();
