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

/**
 * Gets the original URL for a short code
 * 
 * GET /shorten/:shortCode
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params; // Short code has already been validated by middleware

    console.log(`Retrieving original URL for short code: ${shortCode}`);

    // Query the database for the short code
    const selectQuery = `
      SELECT id, url, shortCode, createdAt, updatedAt, accessCount 
      FROM urls 
      WHERE shortCode = ?
    `;
    
    const results = await executeQuery(selectQuery, [shortCode]);

    if (results.length === 0) {
      console.log(`Short code not found: ${shortCode}`);
      return res.status(404).json({
        success: false,
        error: 'Short URL not found',
        message: `No URL found for short code: ${shortCode}`
      });
    }

    const urlRecord = results[0];
    console.log(`Found URL for ${shortCode}: ${urlRecord.url}`);

    // Return the URL data
    res.status(200).json({
      success: true,
      data: {
        id: urlRecord.id,
        url: urlRecord.url,
        shortCode: urlRecord.shortCode,
        shortUrl: `${process.env.BASE_URL}/${urlRecord.shortCode}`,
        createdAt: urlRecord.createdAt,
        updatedAt: urlRecord.updatedAt,
        accessCount: urlRecord.accessCount
      },
      message: 'Short URL retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving original URL:', error);

    // Handle database errors
    if (error.message.includes('Database') || error.code) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: `Failed to retrieve short URL: ${error.message}`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving the short URL.'
    });
  }
};

/**
 * Redirects to the original URL and increments access count
 * 
 * GET /:shortCode
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params; // Short code has already been validated by middleware

    console.log(`Redirecting short code: ${shortCode}`);

    // Get the URL and increment access count in a transaction
    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();

      // First, get the URL
      const [urlResults] = await connection.execute(
        'SELECT id, url FROM urls WHERE shortCode = ?',
        [shortCode]
      );

      if (urlResults.length === 0) {
        await connection.rollback();
        connection.release();
        
        console.log(`Short code not found for redirect: ${shortCode}`);
        return res.status(404).json({
          success: false,
          error: 'Short URL not found',
          message: `No URL found for short code: ${shortCode}`
        });
      }

      const urlRecord = urlResults[0];

      // Increment the access count
      await connection.execute(
        'UPDATE urls SET accessCount = accessCount + 1, updatedAt = NOW() WHERE shortCode = ?',
        [shortCode]
      );

      await connection.commit();
      connection.release();

      console.log(`Redirecting ${shortCode} to ${urlRecord.url} (access count incremented)`);

      // Redirect to the original URL
      res.redirect(302, urlRecord.url);

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (error) {
    console.error('Error during redirect:', error);

    // Handle database errors
    if (error.message.includes('Database') || error.code) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: `Failed to redirect: ${error.message}`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during redirect.'
    });
  }
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  redirectToOriginalUrl,
  checkShortCodeExists
};
