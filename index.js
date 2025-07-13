const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDatabase, closeConnections } = require('./src/config/database');
require('dotenv').config();

// Import routes
const urlRoutes = require('./src/routes/urls');

// Import redirect controller and middleware
const { validateShortCode } = require('./src/middleware/validateShortCode');
const { redirectToOriginalUrl } = require('./src/controllers/urlController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/urls', urlRoutes);

// Redirect route (must be after API routes but before 404 handler)
app.get('/:shortCode', validateShortCode, redirectToOriginalUrl);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'POST /api/urls/shorten': 'Create a short URL',
      'GET /api/urls/shorten/:shortCode': 'Get original URL data',
      'PUT /api/urls/shorten/:shortCode': 'Update URL',
      'DELETE /api/urls/shorten/:shortCode': 'Delete URL',
      'GET /:shortCode': 'Redirect to original URL',
      'GET /health': 'Health check'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
  });
});

// Initialize database and start server
const startServer = async () => {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  closeConnections();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  closeConnections();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
