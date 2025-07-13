/**
 * Controller functions for URL shortening operations
 */

const { executeQuery } = require('../config/database');
const { generateUniqueShortCode } = require('../utils/shortCode');

/**
 * Function to check if a short code already exists in the database
 * 
 * @param {string} shortCode - The short code to check
 * @returns {Promise<boolean>} - True if the code exists, false otherwise
 */
const checkShortCodeExists = async (shortCode) => {
  try {
    const query = 'SELECT id FROM urls WHERE shortCode = ? LIMIT 1';
    const results = await executeQuery(query, [shortCode]);
    return results.length > 0;
  } catch (error) {
    console.error('Error checking if short code exists:', error);
    throw error;
  }
};

/**
 * Creates a shortened URL
 * 
 * POST /shorten
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body; // URL has already been validated by middleware

    console.log(`Creating short URL for: ${url}`);

    // Generate a unique short code
    const shortCode = await generateUniqueShortCode(checkShortCodeExists);

    // Insert the URL into the database
    const insertQuery = `
      INSERT INTO urls (url, shortCode, createdAt, updatedAt, accessCount) 
      VALUES (?, ?, NOW(), NOW(), 0)
    `;
    
    const result = await executeQuery(insertQuery, [url, shortCode]);
    
    // Get the inserted record with timestamps
    const selectQuery = `
      SELECT id, url, shortCode, createdAt, updatedAt, accessCount 
      FROM urls 
      WHERE id = ?
    `;
    
    const [newUrl] = await executeQuery(selectQuery, [result.insertId]);

    if (!newUrl) {
      throw new Error('Failed to retrieve the created URL record');
    }

    console.log(`Successfully created short URL: ${shortCode} for ${url}`);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        id: newUrl.id,
        url: newUrl.url,
        shortCode: newUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`,
        createdAt: newUrl.createdAt,
        updatedAt: newUrl.updatedAt,
        accessCount: newUrl.accessCount
      },
      message: 'Short URL created successfully'
    });

  } catch (error) {
    console.error('Error creating short URL:', error);

    // Handle specific error types
    if (error.message.includes('Failed to generate unique short code')) {
      return res.status(500).json({
        success: false,
        error: 'Code generation failed',
        message: 'Unable to generate a unique short code. Please try again.'
      });
    }

    if (error.message.includes('Database error')) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'A database error occurred while creating the short URL.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the short URL.'
    });
  }
};

module.exports = {
  createShortUrl,
  checkShortCodeExists
};
