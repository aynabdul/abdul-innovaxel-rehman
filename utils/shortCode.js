const crypto = require('crypto');

/**
 * Character set used for short code generation
 * Excludes easily confused characters like '0', 'O', 'l', 'I', etc.
 */
const CHARSET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Constants for validation
 */
const MIN_SHORT_CODE_LENGTH = 6;
const MAX_URL_LENGTH = 2048;

/**
 * Generates a random short code for URLs
 * 
 * @param {number} length - Length of the short code to generate (default: from env or 6)
 * @returns {string} Random string of specified length
 */
const generateShortCode = (length) => {
  // Ensure minimum length of 6 characters
  const codeLength = Math.max(
    MIN_SHORT_CODE_LENGTH,
    Number(length || process.env.SHORT_CODE_LENGTH || MIN_SHORT_CODE_LENGTH)
  );
  
  const byteLength = Math.ceil((codeLength * 6) / 8); // Each char is ~6 bits of entropy, convert to bytes
  const randomBytes = crypto.randomBytes(byteLength);
  let shortCode = '';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = randomBytes[i % byteLength] % CHARSET.length;
    shortCode += CHARSET.charAt(randomIndex);
  }
  
  return shortCode;
};

/**
 * Generates a unique short code that doesn't already exist in the database
 * 
 * @param {function} checkExists - Async function that checks if code exists in DB
 * @param {number} length - Length of the short code
 * @param {number} maxAttempts - Maximum attempts to generate a unique code
 * @returns {Promise<string>} A unique short code
 * @throws {Error} If unable to generate unique code after max attempts or if there's an error
 */
const generateUniqueShortCode = async (
  checkExists,
  length = process.env.SHORT_CODE_LENGTH || MIN_SHORT_CODE_LENGTH,
  maxAttempts = 50 // Increased to 50 to handle potential collisions in larger databases
) => {
  // Validate checkExists is a function
  if (typeof checkExists !== 'function') {
    throw new TypeError('checkExists must be a function that checks if a short code exists in the database');
  }

  // Ensure minimum length
  const codeLength = Math.max(MIN_SHORT_CODE_LENGTH, Number(length));
  
  let attempts = 0;
  let code;
  let exists = true;
  
  console.log(`Generating unique short code with length: ${codeLength}, max attempts: ${maxAttempts}`);
  
  while (exists && attempts < maxAttempts) {
    code = generateShortCode(codeLength);
    attempts++;
    
    try {
      // Check if code exists in database
      exists = await checkExists(code);
      console.log(`Attempt ${attempts}: Generated code "${code}" - ${exists ? 'Already exists' : 'Unique'}`);
    } catch (error) {
      // Handle database errors or other issues
      console.error(`Error checking if short code exists: ${error.message}`);
      throw new Error(`Database error while checking short code: ${error.message}`);
    }
  }
  
  if (exists) {
    console.error(`Failed to generate unique short code after ${maxAttempts} attempts`);
    throw new Error(`Failed to generate unique short code after ${maxAttempts} attempts`);
  }
  
  console.log(`Successfully generated unique code "${code}" after ${attempts} attempt(s)`);
  return code;
};

/**
 * Validates if a string is a valid short code format
 * 
 * @param {string} code - The short code to validate
 * @param {number} length - Expected length of the code
 * @returns {Object} Object containing validation result and error message
 */
const isValidShortCode = (code, length = process.env.SHORT_CODE_LENGTH || MIN_SHORT_CODE_LENGTH) => {
  const codeLength = Math.max(MIN_SHORT_CODE_LENGTH, Number(length));
  
  if (!code) {
    return { 
      valid: false, 
      error: 'Short code is required' 
    };
  }
  
  if (typeof code !== 'string') {
    return { 
      valid: false, 
      error: 'Short code must be a string' 
    };
  }
  
  if (code.length !== codeLength) {
    return { 
      valid: false, 
      error: `Short code must be exactly ${codeLength} characters long` 
    };
  }
  
  // Check if code contains only characters from our charset
  const validChars = new RegExp(`^[${CHARSET}]+$`);
  if (!validChars.test(code)) {
    return { 
      valid: false, 
      error: `Short code contains invalid characters. Only characters from the set [${CHARSET}] are allowed` 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validates if a URL is properly formatted
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
};

/**
 * Restricts URL length to a maximum value
 * 
 * @param {string} url - The URL to check
 * @param {number} maxLength - Maximum allowed URL length
 * @returns {Object} Object containing validation result and error message
 */
const restrictUrlLength = (url, maxLength = MAX_URL_LENGTH) => {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL must be a non-empty string'
    };
  }
  
  if (url.length > maxLength) {
    return {
      valid: false,
      error: `URL exceeds maximum length of ${maxLength} characters`
    };
  }
  
  return { valid: true, error: null };
};

module.exports = {
  generateShortCode,
  generateUniqueShortCode,
  isValidShortCode,
  isValidUrl,
  restrictUrlLength,
  CHARSET,
  MIN_SHORT_CODE_LENGTH,
  MAX_URL_LENGTH
};
