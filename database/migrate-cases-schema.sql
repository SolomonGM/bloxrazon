-- Migration script to fix cases schema
-- This will drop and recreate cases-related tables to match the backend code

USE defaultdb;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Drop tables in any order (foreign keys disabled)
DROP TABLE IF EXISTS caseOpenings;
DROP TABLE IF EXISTS caseItems;
DROP TABLE IF EXISTS caseVersions;
DROP TABLE IF EXISTS cases;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Create tables with correct schema (from schema.sql)
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    img VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caseVersions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caseId INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS caseItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caseVersionId INT NOT NULL,
    robloxId VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    img VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    rangeFrom INT NOT NULL,
    rangeTo INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id)
);

CREATE TABLE IF NOT EXISTS caseOpenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    caseVersionId INT NOT NULL,
    rollId INT NOT NULL,
    caseItemId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id),
    FOREIGN KEY (caseItemId) REFERENCES caseItems(id)
);

-- fairRolls should already exist, but ensure it's correct
CREATE TABLE IF NOT EXISTS fairRolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serverSeed VARCHAR(255) NOT NULL,
    clientSeed VARCHAR(255) NOT NULL,
    nonce INT NOT NULL,
    seed VARCHAR(255) NOT NULL,
    result INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Schema migration completed successfully' as status;
