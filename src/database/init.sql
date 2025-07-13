-- URL Shortener Database Initialization Script
-- Run this script in MySQL Workbench or command line

-- Creating the database
CREATE DATABASE IF NOT EXISTS url_shortener;

-- Use the created database
USE url_shortener;

-- Creating the urls table
CREATE TABLE IF NOT EXISTS urls (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    shortCode VARCHAR(6) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    accessCount BIGINT UNSIGNED NOT NULL DEFAULT 0,
    INDEX idx_shortCode (shortCode)
);

-- Verify table creation
DESCRIBE urls;

-- Show table structure
SHOW CREATE TABLE urls;

-- Display success message
SELECT 'URL Shortener database initialized successfully!' AS message;
