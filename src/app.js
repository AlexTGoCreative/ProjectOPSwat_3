const express = require('express');
const cors = require('cors');
require('dotenv').config();

const oauthRoutes = require('./routes/oauth');
const dataRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    app: 'OAuth & JWT Workshop'
  });
});

// Routes
app.use('/oauth', oauthRoutes);
app.use('/', dataRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth & JWT Workshop server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 