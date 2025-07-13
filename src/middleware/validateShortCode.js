/**
 * Middleware for validating short code parameters
 */

const { isValidShortCode } = require('../utils/shortCode');

/**
 * Validates short code parameter in URL paths
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateShortCode = (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Check if shortCode parameter exists
    if (!shortCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing short code parameter',
        message: 'Short code parameter is required in the URL path'
      });
    }

    // Validate the short code format using the utility function
    const validation = isValidShortCode(shortCode);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid short code format',
        message: validation.error
      });
    }

    // If validation passes, continue to the next middleware/controller
    next();

  } catch (error) {
    console.error('Error in validateShortCode middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while validating the short code'
    });
  }
};

module.exports = {
  validateShortCode
};
