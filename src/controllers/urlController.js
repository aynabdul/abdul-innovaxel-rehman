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

/**
 * Updates an existing shortened URL
 * 
 * PUT /shorten/:shortCode
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateShortUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { url } = req.body; // URL has already been validated by middleware

    console.log(`Updating short URL ${shortCode} with new URL: ${url}`);

    // Check if the short code exists
    const selectQuery = `
      SELECT id, url, shortCode, createdAt, updatedAt, accessCount 
      FROM urls 
      WHERE shortCode = ?
    `;
    
    const results = await executeQuery(selectQuery, [shortCode]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Short URL not found',
        message: `No short URL found with code: ${shortCode}`
      });
    }

    // Update the URL and timestamp
    const updateQuery = `
      UPDATE urls 
      SET url = ?, updatedAt = NOW() 
      WHERE shortCode = ?
    `;
    
    await executeQuery(updateQuery, [url, shortCode]);

    // Get the updated record
    const updatedResults = await executeQuery(selectQuery, [shortCode]);
    const updatedUrl = updatedResults[0];

    console.log(`Successfully updated short URL: ${shortCode}`);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        id: updatedUrl.id,
        url: updatedUrl.url,
        shortCode: updatedUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${updatedUrl.shortCode}`,
        createdAt: updatedUrl.createdAt,
        updatedAt: updatedUrl.updatedAt,
        accessCount: updatedUrl.accessCount
      },
      message: 'Short URL updated successfully'
    });

  } catch (error) {
    console.error('Error updating short URL:', error);

    // Handle database errors
    if (error.message.includes('Database error')) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'A database error occurred while updating the short URL.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while updating the short URL.'
    });
  }
};

/**
 * Deletes an existing shortened URL
 * 
 * DELETE /shorten/:shortCode
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShortUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    console.log(`Deleting short URL: ${shortCode}`);

    // Check if the short code exists before deletion
    const selectQuery = `
      SELECT id, url, shortCode 
      FROM urls 
      WHERE shortCode = ?
    `;
    
    const results = await executeQuery(selectQuery, [shortCode]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Short URL not found',
        message: `No short URL found with code: ${shortCode}`
      });
    }

    // Delete the record
    const deleteQuery = 'DELETE FROM urls WHERE shortCode = ?';
    await executeQuery(deleteQuery, [shortCode]);

    console.log(`Successfully deleted short URL: ${shortCode}`);

    // Return 204 No Content (success with no response body)
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting short URL:', error);

    // Handle database errors
    if (error.message.includes('Database error')) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'A database error occurred while deleting the short URL.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while deleting the short URL.'
    });
  }
};

/**
 * Gets statistics for a shortened URL
 * 
 * GET /stats/:shortCode
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params; // Already validated by middleware

    console.log(`Getting statistics for short code: ${shortCode}`);

    // Query the database for the URL with the given short code
    const query = `
      SELECT id, url, shortCode, createdAt, updatedAt, accessCount 
      FROM urls 
      WHERE shortCode = ? 
      LIMIT 1
    `;
    
    const results = await executeQuery(query, [shortCode]);

    if (results.length === 0) {
      console.log(`Short code not found: ${shortCode}`);
      return res.status(404).json({
        success: false,
        error: 'Short URL not found',
        message: `No URL found with short code: ${shortCode}`
      });
    }

    const urlData = results[0];

    console.log(`Statistics retrieved for short code: ${shortCode}, access count: ${urlData.accessCount}`);

    // Return success response with statistics
    res.status(200).json({
      success: true,
      data: {
        id: urlData.id,
        url: urlData.url,
        shortCode: urlData.shortCode,
        shortUrl: `${process.env.BASE_URL}/${urlData.shortCode}`,
        createdAt: urlData.createdAt,
        updatedAt: urlData.updatedAt,
        accessCount: urlData.accessCount,
        statistics: {
          totalAccesses: urlData.accessCount,
          createdDaysAgo: Math.floor((new Date() - new Date(urlData.createdAt)) / (1000 * 60 * 60 * 24)),
          lastUpdated: urlData.updatedAt
        }
      },
      message: 'URL statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting URL statistics:', error);

    // Handle database errors
    if (error.message.includes('Database error')) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'A database error occurred while retrieving URL statistics.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving URL statistics.'
    });
  }
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  redirectToOriginalUrl,
  updateShortUrl,
  deleteShortUrl,
  getUrlStats,
  checkShortCodeExists
};
