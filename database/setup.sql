-- Create database and oauth_clients table for Workshop Phase 2
-- Run this script to set up PostgreSQL database

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE workshop_oauth;

-- Connect to workshop_oauth database and run the following:

-- Create oauth_clients table
CREATE TABLE IF NOT EXISTS oauth_clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample OAuth clients for testing
INSERT INTO oauth_clients (client_id, client_secret) VALUES 
('client_id_1', 'client_secret_1'),
('client_id_2', 'client_secret_2'),
('client_id_3', 'client_secret_3'),
('workshop_client', 'workshop_secret_123')
ON CONFLICT (client_id) DO NOTHING;

-- Verify the data
SELECT * FROM oauth_clients;
