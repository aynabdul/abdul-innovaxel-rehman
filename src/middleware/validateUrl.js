/**
 * Middleware for validating URL input in requests
 */

const { isValidUrl, restrictUrlLength } = require('../utils/shortCode');

/**
 * Validates URL in request body for the POST /shorten endpoint
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateUrl = (req, res, next) => {
  try {
    // Check if request body exists and is a valid JSON object
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Request body must be a valid JSON object'
      });
    }

    // Check if URL field exists
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL field',
        message: 'The "url" field is required in the request body'
      });
    }

    // Check if URL is a non-empty string
    if (typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL field',
        message: 'The "url" field must be a non-empty string'
      });
    }

    // Trim whitespace from URL
    const trimmedUrl = url.trim();

    // Validate URL format using isValidUrl function
    if (!isValidUrl(trimmedUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        message: 'The URL must be a valid HTTP or HTTPS URL (e.g., https://example.com)'
      });
    }

    // Check URL length restrictions
    const lengthValidation = restrictUrlLength(trimmedUrl);
    if (!lengthValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'URL too long',
        message: lengthValidation.error
      });
    }

    // If all validation passes, store the trimmed URL back to req.body
    req.body.url = trimmedUrl;
    
    // Call next middleware/controller
    next();

  } catch (error) {
    console.error('Error in validateUrl middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while validating the URL'
    });
  }
};

module.exports = {
  validateUrl
};
