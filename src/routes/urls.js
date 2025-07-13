/**
 * URL routes for the URL shortener API
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { validateUrl } = require('../middleware/validateUrl');
const { validateShortCode } = require('../middleware/validateShortCode');
const { createShortUrl, getOriginalUrl, updateShortUrl, deleteShortUrl } = require('../controllers/urlController');

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
 * GET /shorten/:shortCode
 * Retrieves the original URL for a short code
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
 *     "accessCount": 5
 *   },
 *   "message": "Short URL retrieved successfully"
 * }
 */
router.get('/shorten/:shortCode', validateShortCode, getOriginalUrl);

/**
 * PUT /shorten/:shortCode
 * Updates an existing shortened URL
 * 
 * Request body:
 * {
 *   "url": "https://www.example.com/updated/url"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "url": "https://www.example.com/updated/url",
 *     "shortCode": "abc123",
 *     "shortUrl": "http://localhost:3000/abc123",
 *     "createdAt": "2025-07-13T10:30:00.000Z",
 *     "updatedAt": "2025-07-13T10:35:00.000Z",
 *     "accessCount": 5
 *   },
 *   "message": "Short URL updated successfully"
 * }
 */
router.put('/shorten/:shortCode', validateShortCode, validateUrl, updateShortUrl);

/**
 * DELETE /shorten/:shortCode
 * Deletes an existing shortened URL
 * 
 * Response: 204 No Content on success
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Short URL not found",
 *   "message": "No short URL found with code: abc123"
 * }
 */
router.delete('/shorten/:shortCode', validateShortCode, deleteShortUrl);

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
      'GET /api/urls/shorten/:shortCode': 'Get original URL data',
      'PUT /api/urls/shorten/:shortCode': 'Update URL',
      'DELETE /api/urls/shorten/:shortCode': 'Delete URL',
      'GET /api/urls/:shortCode/stats': 'Get URL statistics (coming soon)'
    }
  });
});

module.exports = router;
