/**
 * URL routes for the URL shortener API
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { validateUrl } = require('../middleware/validateUrl');
const { createShortUrl } = require('../controllers/urlController');

/**
 * POST /shorten
 * Creates a new shortened URL
 * 
 * Request body:
 * {
 *   "url": "https://example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "url": "https://example.com",
 *     "shortCode": "abc123",
 *     "shortUrl": "http://localhost:3000/abc123",
 *     "createdAt": "2025-07-13T10:30:00.000Z",
 *     "updatedAt": "2025-07-13T10:30:00.000Z",
 *     "accessCount": 0
 *   },
 *   "message": "Short URL created successfully"
 * }
 */
router.post('/shorten', validateUrl, createShortUrl);

/**
 * GET /
 * API information endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      'POST /api/urls/shorten': 'Create a short URL',
      'GET /api/urls/:shortCode': 'Retrieve original URL',
      'PUT /api/urls/:shortCode': 'Update URL',
      'DELETE /api/urls/:shortCode': 'Delete URL',
      'GET /api/urls/:shortCode/stats': 'Get URL statistics'
    }
  });
});

module.exports = router;
