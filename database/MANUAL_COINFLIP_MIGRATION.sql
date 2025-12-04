-- ============================================
-- COINFLIP TABLE MIGRATION
-- Run these commands in your MySQL client
-- ============================================

-- Add ownerId column if it doesn't exist
ALTER TABLE coinflips 
ADD COLUMN ownerId INT NOT NULL AFTER id;

-- Add foreign key constraint for ownerId
ALTER TABLE coinflips 
ADD CONSTRAINT fk_coinflips_owner 
FOREIGN KEY (ownerId) REFERENCES users(id);

-- Add startedAt column if it doesn't exist
ALTER TABLE coinflips 
ADD COLUMN startedAt TIMESTAMP NULL AFTER serverSeed;

-- Verify the changes
DESCRIBE coinflips;

-- Expected output should include:
-- id, ownerId, fire, ice, amount, winnerSide, privKey, minLevel, 
-- EOSBlock, clientSeed, serverSeed, startedAt, result, endedAt, createdAt
