-- Fix the 'type' column in rakebackClaims table
-- This resolves the "Data truncated for column 'type'" error

-- First, check if the table exists and modify it
ALTER TABLE rakebackClaims 
MODIFY COLUMN type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL;

-- Add indexes if they don't exist (safe to run multiple times)
ALTER TABLE rakebackClaims ADD INDEX IF NOT EXISTS idx_user_type (userId, type);
ALTER TABLE rakebackClaims ADD INDEX IF NOT EXISTS idx_user_created (userId, createdAt);
